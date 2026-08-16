# F07 Gigago Fulfillment Terminal Corrective R1

## Mục tiêu

Đảm bảo delayed reconciliation chỉ kết thúc `succeeded` khi toàn bộ chuỗi đã
đạt trạng thái terminal:

- Gigago đã trả đủ eSIM ở trạng thái Delivered và có dữ liệu cài đặt;
- delivery hash đã được ghi;
- email khách hàng đã gửi đúng một lần và bind đúng delivery hash;
- mail orchestration đã `completed` và bind đúng delivery hash;
- WooCommerce order đã ở trạng thái `completed`.

## Nguyên nhân

Baseline có hai lỗ hổng:

1. Payment replay cùng transaction trả về sớm, làm fast-ACK/delayed job không
   tiếp tục fulfillment idempotent.
2. Job `pending-fulfillment` chạy lại payment automation rồi có thể chuyển
   `succeeded` mà chưa poll Gigago, chưa xác nhận email và chưa xác nhận trạng
   thái WooCommerce.

Recovery package R1 còn dùng sai metadata key. Source thực tế dùng
`_ysim_esim_delivery_snapshot`, không phải
`_ysim_esim_secure_delivery_snapshot`. Corrective terminal không phụ thuộc raw
snapshot hoặc QR/LPA; nó chỉ sử dụng trạng thái và hash binding an toàn.

## Thay đổi

- Payment replay cùng transaction chỉ trả về sớm ở mode `record`; mode
  `fulfill` tiếp tục đường submit/recovery deterministic hiện hữu.
- `pending-fulfillment` gọi status-only Gigago path, không gọi provider-create.
- Job chỉ `succeeded` khi terminal assessment xác nhận delivery, email exactly
  once, hash binding và WooCommerce `completed`.
- Delivery status bổ sung terminal view không chứa ICCID, QR, LPA hoặc email.
- Gigago Production vẫn bị chặn bởi contract Sandbox hiện hành.

## Ngoài phạm vi

- Không thay đổi order `6403`.
- Không gọi GPay/Gigago hoặc gửi email trong build/test.
- Không bật payment, fulfillment, scheduler hoặc customer-email flags.
- Không thay đổi Production runtime, credential hoặc provider endpoint.
- Không suy diễn Gigago Production contract từ Sandbox.

## Independent review corrective

- Same-transaction replay đọc terminal evidence cục bộ trước. Khi đã có
  submission evidence, replay chuyển sang status-only và không đi qua
  provider-create.
- Pending fulfillment đọc local terminal trước khi gọi Gigago; terminal local
  không bị hạ cấp chỉ vì provider tạm thời không truy cập được.
- Job `fulfill/succeeded` cũ thiếu `deliveryTerminal.terminal=true` được
  reclassify thành `pending-fulfillment`; reconciliation sweep có thể phát hiện
  và revalidate theo cùng contract, không có ngoại lệ theo order ID.
- Job format được nâng lên `f04.3.3.2`; các phiên bản cũ vẫn parse fail-closed
  và được normalize trước khi xử lý.
