<?php
/**
 * Plugin Name: YSim F07 Production and Sandbox Email Terminal Pipeline
 * Description: Exactly-once production and sandbox eSIM delivery email consumer.
 * Version: 2.0.0
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

const YSIM_F07_EMAIL_TERMINAL_VERSION = 'f07-production-sandbox-email-terminal-r2';
const YSIM_F07_EMAIL_TERMINAL_OPTION = 'ysim_f07_sandbox_email_terminal_enabled';
const YSIM_F07_EMAIL_TERMINAL_HOOK = 'ysim_f07_sandbox_email_terminal_execute';
const YSIM_F07_EMAIL_TERMINAL_GROUP = 'ysim-f07-sandbox-email-terminal';

function ysim_f07_email_string(mixed $value): string
{
    return is_scalar($value) ? trim((string) $value) : '';
}

function ysim_f07_email_snapshot(mixed $value): array
{
    if (is_array($value)) {
        return $value;
    }

    if (is_string($value) && $value !== '') {
        $decoded = json_decode($value, true);
        return is_array($decoded) ? $decoded : [];
    }

    return [];
}

function ysim_f07_email_sha256(string $value): bool
{
    return preg_match('/^[0-9a-f]{64}$/', strtolower($value)) === 1;
}

function ysim_f07_email_items(WC_Order $order): array
{
    $snapshot = ysim_f07_email_snapshot(
        $order->get_meta('_ysim_esim_delivery_snapshot', true)
    );
    $items = $snapshot['items'] ?? null;

    if (!is_array($items) || count($items) < 1) {
        throw new RuntimeException('DELIVERY_SNAPSHOT_ITEMS_MISSING');
    }

    foreach ($items as $item) {
        if (!is_array($item)) {
            throw new RuntimeException('DELIVERY_SNAPSHOT_ITEM_INVALID');
        }

        $iccid = ysim_f07_email_string($item['iccid'] ?? '');
        $qrCode = ysim_f07_email_string($item['qrCode'] ?? '');
        $shortLink = ysim_f07_email_string($item['shortLink'] ?? '');

        if ($iccid === '' || ($qrCode === '' && $shortLink === '')) {
            throw new RuntimeException('DELIVERY_INSTALLATION_DATA_MISSING');
        }
    }

    return $items;
}

function ysim_f07_email_environment(WC_Order $order): string
{
    return strtolower(ysim_f07_email_string(
        $order->get_meta('_ysim_gigago_readiness_environment', true)
    ));
}

function ysim_f07_email_preflight(WC_Order $order): array
{
    if (get_option(YSIM_F07_EMAIL_TERMINAL_OPTION, '0') !== '1') {
        throw new RuntimeException('PIPELINE_DISABLED');
    }

    $environment = ysim_f07_email_environment($order);
    if (!in_array($environment, ['production', 'sandbox'], true)) {
        throw new RuntimeException('UNSUPPORTED_ORDER_ENVIRONMENT');
    }

    if ($order->get_payment_method() !== 'gpay_virtual_account') {
        throw new RuntimeException('PAYMENT_METHOD_MISMATCH');
    }

    if (strtoupper(ysim_f07_email_string(
        $order->get_meta('_ysim_payment_status', true)
    )) !== 'SUCCESS') {
        throw new RuntimeException('PAYMENT_STATUS_NOT_SUCCESS');
    }

    if (!$order->get_date_paid()) {
        throw new RuntimeException('ORDER_NOT_PAID');
    }

    if (ysim_f07_email_string(
        $order->get_meta('_ysim_esim_delivery_status', true)
    ) !== 'ready') {
        throw new RuntimeException('DELIVERY_NOT_READY');
    }

    $deliveryHash = strtolower(ysim_f07_email_string(
        $order->get_meta('_ysim_esim_delivery_hash', true)
    ));
    if (!ysim_f07_email_sha256($deliveryHash)) {
        throw new RuntimeException('DELIVERY_HASH_INVALID');
    }

    $deliveryCount = (int) $order->get_meta('_ysim_esim_delivery_count', true);
    $items = ysim_f07_email_items($order);
    if ($deliveryCount < 1 || count($items) !== $deliveryCount) {
        throw new RuntimeException('DELIVERY_COUNT_MISMATCH');
    }

    $email = sanitize_email((string) $order->get_billing_email());
    if ($email === '' || !is_email($email)) {
        throw new RuntimeException('CUSTOMER_EMAIL_INVALID');
    }

    $emailStatus = strtolower(ysim_f07_email_string(
        $order->get_meta('_ysim_esim_customer_email_status', true)
    ));
    $emailAttempts = (int) $order->get_meta(
        '_ysim_esim_customer_email_attempts',
        true
    );
    $emailHash = strtolower(ysim_f07_email_string(
        $order->get_meta('_ysim_esim_customer_email_delivery_hash', true)
    ));
    $mailStatus = strtolower(ysim_f07_email_string(
        $order->get_meta('_ysim_esim_mail_orchestration_status', true)
    ));
    $requestHash = strtolower(ysim_f07_email_string(
        $order->get_meta('_ysim_esim_mail_orchestration_requested_hash', true)
    ));

    $alreadyTerminal = $order->get_status() === 'completed'
        && $emailStatus === 'sent'
        && $emailAttempts === 1
        && hash_equals($deliveryHash, $emailHash)
        && $mailStatus === 'completed'
        && hash_equals($deliveryHash, $requestHash);

    if ($alreadyTerminal) {
        return [
            'terminal' => true,
            'delivery_hash' => $deliveryHash,
            'items' => $items,
            'email' => $email,
            'environment' => $environment,
        ];
    }

    if ($emailStatus !== 'pending' || $emailAttempts !== 0) {
        throw new RuntimeException('CUSTOMER_EMAIL_NOT_EXACTLY_ONCE_ELIGIBLE');
    }

    if (!in_array($mailStatus, ['requested', 'queued'], true)
        || !hash_equals($deliveryHash, $requestHash)) {
        throw new RuntimeException('MAIL_REQUEST_BINDING_INVALID');
    }

    return [
        'terminal' => false,
        'delivery_hash' => $deliveryHash,
        'items' => $items,
        'email' => $email,
        'environment' => $environment,
    ];
}

function ysim_f07_email_body(WC_Order $order, array $items): string
{
    $body = '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#17221a">';
    $body .= '<h2 style="color:#008b45">eSIM YSim của bạn đã sẵn sàng</h2>';
    $body .= '<p>Đơn hàng <strong>#' . esc_html((string) $order->get_order_number()) . '</strong> đã được thanh toán và phát hành thành công.</p>';

    foreach ($items as $index => $item) {
        $number = (int) $index + 1;
        $planId = ysim_f07_email_string($item['planId'] ?? 'eSIM');
        $iccid = ysim_f07_email_string($item['iccid'] ?? '');
        $qrCode = ysim_f07_email_string($item['qrCode'] ?? '');
        $shortLink = ysim_f07_email_string($item['shortLink'] ?? '');

        $body .= '<hr><h3>eSIM ' . esc_html((string) $number) . '</h3>';
        $body .= '<p><strong>Gói:</strong> ' . esc_html($planId) . '</p>';
        $body .= '<p><strong>ICCID:</strong> <code>' . esc_html($iccid) . '</code></p>';

        if ($shortLink !== '' && preg_match('#^https://#i', $shortLink)) {
            $body .= '<p><strong>Liên kết cài đặt:</strong> <a href="'
                . esc_url($shortLink)
                . '">Mở hướng dẫn cài đặt eSIM</a></p>';
        }

        if ($qrCode !== '') {
            if (preg_match('#^https://#i', $qrCode)) {
                $body .= '<p><strong>Mã QR:</strong><br><img src="'
                    . esc_url($qrCode)
                    . '" alt="QR cài đặt eSIM" style="max-width:280px;height:auto"></p>';
            } elseif (str_starts_with($qrCode, 'data:image/')) {
                $body .= '<p><strong>Mã QR:</strong><br><img src="'
                    . esc_attr($qrCode)
                    . '" alt="QR cài đặt eSIM" style="max-width:280px;height:auto"></p>';
            } else {
                $body .= '<p><strong>Mã cài đặt thủ công:</strong><br><code style="word-break:break-all">'
                    . esc_html($qrCode)
                    . '</code></p>';
            }
        }
    }

    $body .= '<p>Vui lòng lưu email này và không chia sẻ mã cài đặt eSIM cho người khác.</p>';
    $body .= '<p>Trân trọng,<br>YSim</p></div>';

    return $body;
}

function ysim_f07_email_mark_reconciliation_terminal(WC_Order $order, string $now): void
{
    $rawJob = ysim_f07_email_string(
        $order->get_meta('_ysim_gpay_reconciliation_job', true)
    );
    $job = $rawJob !== '' ? json_decode($rawJob, true) : null;

    if (is_array($job) && (int) ($job['orderId'] ?? 0) === (int) $order->get_id()) {
        $job['state'] = 'succeeded';
        $job['nextAttemptAt'] = null;
        $job['lastError'] = null;
        $job['updatedAt'] = $now;
        $order->update_meta_data(
            '_ysim_gpay_reconciliation_job',
            wp_json_encode($job, JSON_UNESCAPED_SLASHES)
        );
    }

    $order->update_meta_data('_ysim_gpay_reconciliation_state', 'succeeded');
    $order->update_meta_data('_ysim_gpay_reconciliation_next_at', '');
    $order->update_meta_data('_ysim_gpay_reconciliation_last_error', '');
    $order->update_meta_data('_ysim_gpay_reconciliation_updated_at', $now);
    $order->update_meta_data('_ysim_esim_action_required_status', 'obsolete');
    $order->update_meta_data('_ysim_esim_action_required_completed_at', $now);
}

function ysim_f07_email_terminal_execute(int $orderId): bool
{
    if ($orderId <= 0 || !function_exists('wc_get_order') || !function_exists('wp_mail')) {
        throw new RuntimeException('WORDPRESS_WOOCOMMERCE_MAIL_RUNTIME_INVALID');
    }

    $order = wc_get_order($orderId);
    if (!$order instanceof WC_Order) {
        throw new RuntimeException('ORDER_NOT_FOUND');
    }

    $preflight = ysim_f07_email_preflight($order);
    if ($preflight['terminal'] === true) {
        return true;
    }

    $lockName = 'ysim_f07_sandbox_email_terminal_lock_' . $orderId;
    $lockValue = wp_generate_uuid4();
    if (!add_option($lockName, $lockValue, '', false)) {
        $reloaded = wc_get_order($orderId);
        if ($reloaded instanceof WC_Order) {
            $terminal = ysim_f07_email_preflight($reloaded);
            if ($terminal['terminal'] === true) {
                return true;
            }
        }
        throw new RuntimeException('EMAIL_ONE_SHOT_LOCK_ALREADY_PRESENT');
    }

    $attemptStarted = false;

    try {
        $order = wc_get_order($orderId);
        if (!$order instanceof WC_Order) {
            throw new RuntimeException('ORDER_RELOAD_BEFORE_MAIL_FAILED');
        }
        $preflight = ysim_f07_email_preflight($order);
        if ($preflight['terminal'] === true) {
            return true;
        }

        $attemptedAt = gmdate('c');
        $order->update_meta_data('_ysim_esim_customer_email_status', 'sending');
        $order->update_meta_data('_ysim_esim_customer_email_attempts', 1);
        $order->update_meta_data('_ysim_esim_customer_email_last_attempt_at', $attemptedAt);
        $order->update_meta_data('_ysim_esim_customer_email_error', '');
        $order->update_meta_data('_ysim_esim_customer_email_delivery_hash', $preflight['delivery_hash']);
        $order->update_meta_data('_ysim_esim_mail_orchestration_status', 'processing');
        $order->update_meta_data('_ysim_esim_mail_orchestration_error', '');
        $order->save();
        $attemptStarted = true;

        $subjectPrefix = $preflight['environment'] === 'sandbox'
            ? '[YSim Sandbox]'
            : '[YSim]';
        $subject = sprintf(
            '%s Thông tin eSIM cho đơn #%s',
            $subjectPrefix,
            (string) $order->get_order_number()
        );
        $accepted = wp_mail(
            $preflight['email'],
            $subject,
            ysim_f07_email_body($order, $preflight['items']),
            ['Content-Type: text/html; charset=UTF-8']
        );

        if (!$accepted) {
            throw new RuntimeException('WP_MAIL_RETURNED_FALSE');
        }

        $sentAt = gmdate('c');
        $order = wc_get_order($orderId);
        if (!$order instanceof WC_Order) {
            throw new RuntimeException('ORDER_RELOAD_AFTER_MAIL_FAILED');
        }
        $order->update_meta_data('_ysim_esim_customer_email_status', 'sent');
        $order->update_meta_data('_ysim_esim_customer_email_sent_at', $sentAt);
        $order->update_meta_data('_ysim_esim_customer_email_attempts', 1);
        $order->update_meta_data('_ysim_esim_customer_email_error', '');
        $order->update_meta_data('_ysim_esim_customer_email_delivery_hash', $preflight['delivery_hash']);
        $order->update_meta_data('_ysim_esim_customer_email_action_id', 0);
        $order->update_meta_data('_ysim_esim_mail_orchestration_status', 'completed');
        $order->update_meta_data('_ysim_esim_mail_orchestration_error', '');
        $order->update_meta_data('_ysim_esim_recovery_version', YSIM_F07_EMAIL_TERMINAL_VERSION);
        ysim_f07_email_mark_reconciliation_terminal($order, $sentAt);
        $order->save();

        if ($order->get_status() !== 'completed') {
            add_filter('woocommerce_email_enabled_customer_completed_order', '__return_false', 9999);
            remove_all_actions('woocommerce_order_status_completed_notification');
            remove_all_actions('woocommerce_order_status_processing_to_completed_notification');
            $order->update_status(
                'completed',
                'YSim ' . ucfirst($preflight['environment']) . ': eSIM delivery email accepted by WordPress mail transport.',
                false
            );
        }

        return true;
    } catch (Throwable $error) {
        if (!$attemptStarted) {
            delete_option($lockName);
        } else {
            $failedOrder = wc_get_order($orderId);
            if ($failedOrder instanceof WC_Order) {
                $failedOrder->update_meta_data('_ysim_esim_customer_email_status', 'failed');
                $failedOrder->update_meta_data('_ysim_esim_customer_email_error', 'MAIL_TRANSPORT_OR_FINALIZATION_FAILED');
                $failedOrder->update_meta_data('_ysim_esim_mail_orchestration_status', 'failed');
                $failedOrder->update_meta_data('_ysim_esim_mail_orchestration_error', 'MAIL_TRANSPORT_OR_FINALIZATION_FAILED');
                $failedOrder->save();
            }
        }
        throw $error;
    }
}

function ysim_f07_email_terminal_enqueue(WC_Order $order): void
{
    try {
        if (strtolower(ysim_f07_email_string(
            $order->get_meta('_ysim_esim_mail_orchestration_status', true)
        )) !== 'requested') {
            return;
        }

        $preflight = ysim_f07_email_preflight($order);
        if ($preflight['terminal'] === true) {
            return;
        }

        if (!function_exists('as_enqueue_async_action')) {
            $order->update_meta_data('_ysim_esim_mail_orchestration_status', 'enqueue-failed');
            $order->update_meta_data('_ysim_esim_mail_orchestration_error', 'ACTION_SCHEDULER_UNAVAILABLE');
            $order->save_meta_data();
            return;
        }

        $actionId = as_enqueue_async_action(
            YSIM_F07_EMAIL_TERMINAL_HOOK,
            ['order_id' => (int) $order->get_id()],
            YSIM_F07_EMAIL_TERMINAL_GROUP,
            true,
            10
        );

        if ((int) $actionId <= 0) {
            throw new RuntimeException('ACTION_SCHEDULER_ENQUEUE_FAILED');
        }

        $order->update_meta_data('_ysim_esim_customer_email_action_id', (int) $actionId);
        $order->update_meta_data('_ysim_esim_mail_orchestration_status', 'queued');
        $order->update_meta_data('_ysim_esim_mail_orchestration_error', '');
        $order->save_meta_data();
    } catch (RuntimeException $error) {
        if (in_array($error->getMessage(), [
            'PIPELINE_DISABLED',
            'UNSUPPORTED_ORDER_ENVIRONMENT',
            'DELIVERY_NOT_READY',
            'CUSTOMER_EMAIL_NOT_EXACTLY_ONCE_ELIGIBLE',
            'MAIL_REQUEST_BINDING_INVALID',
        ], true)) {
            return;
        }

        error_log('YSim email terminal enqueue failed for order ' . $order->get_id());
    }
}

function ysim_f07_email_terminal_after_order_save(WC_Order $order): void
{
    ysim_f07_email_terminal_enqueue($order);
}

function ysim_f07_email_terminal_action(int $orderId): void
{
    try {
        ysim_f07_email_terminal_execute($orderId);
    } catch (Throwable $error) {
        error_log('YSim email terminal execution failed for order ' . $orderId);
    }
}

add_action(
    'woocommerce_after_order_object_save',
    'ysim_f07_email_terminal_after_order_save',
    20,
    1
);
add_action(
    YSIM_F07_EMAIL_TERMINAL_HOOK,
    'ysim_f07_email_terminal_action',
    10,
    1
);
