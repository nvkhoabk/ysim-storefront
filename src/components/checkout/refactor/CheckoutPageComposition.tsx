import {
  Container,
  PageShell,
  Section,
} from "@/components/layout";

import type {
  CheckoutCustomerFormState,
  CheckoutFormErrors,
  CheckoutPageViewModel,
  CheckoutPaymentMethodId,
  CheckoutRecipientFormState,
  CheckoutSubmitPreview,
} from "@/types/view-models/checkout-refactor";

import {
  CheckoutOrderSummary,
} from "./CheckoutOrderSummary";

import {
  CheckoutSection,
} from "./CheckoutSection";

import {
  CheckoutSuccessState,
} from "./CheckoutSuccessState";

import {
  CustomerInformationForm,
} from "./CustomerInformationForm";

import {
  EsimRecipientForm,
} from "./EsimRecipientForm";

import {
  PaymentMethodSelector,
} from "./PaymentMethodSelector";

import {
  TermsConfirmation,
} from "./TermsConfirmation";

export interface CheckoutPageCompositionProps {
  page:
    CheckoutPageViewModel;
  customer:
    CheckoutCustomerFormState;
  recipient:
    CheckoutRecipientFormState;
  paymentMethod:
    CheckoutPaymentMethodId;
  acceptTerms: boolean;
  errors:
    CheckoutFormErrors;
  submitting: boolean;
  result?:
    CheckoutSubmitPreview;
  onCustomerChange:
    (
      value:
        CheckoutCustomerFormState,
    ) => void;
  onRecipientChange:
    (
      value:
        CheckoutRecipientFormState,
    ) => void;
  onPaymentMethodChange:
    (
      value:
        CheckoutPaymentMethodId,
    ) => void;
  onAcceptTermsChange:
    (value: boolean) => void;
  onSubmit:
    () => void;
  onReset:
    () => void;
}

export function CheckoutPageComposition({
  page,
  customer,
  recipient,
  paymentMethod,
  acceptTerms,
  errors,
  submitting,
  result,
  onCustomerChange,
  onRecipientChange,
  onPaymentMethodChange,
  onAcceptTermsChange,
  onSubmit,
  onReset,
}: CheckoutPageCompositionProps) {
  return (
    <PageShell
      cartCount={
        page.totals
          .itemCount
      }
    >
      <Section
        variant="subtle"
        spacing="lg"
      >
        <Container>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--ysim-color-brand-700)]">
            Thanh toán
          </p>

          <h1 className="mt-2 text-[var(--ysim-font-size-display)] font-bold leading-[var(--ysim-line-height-tight)] tracking-[-0.05em] text-[var(--ysim-color-text)]">
            Hoàn tất đơn hàng
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--ysim-color-text-muted)]">
            Nhập thông tin nhận eSIM và chọn phương thức thanh toán phù hợp.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          {result ? (
            <CheckoutSuccessState
              result={
                result
              }
              onReset={
                onReset
              }
            />
          ) : (
            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
              <div className="space-y-5">
                <CheckoutSection
                  step={1}
                  title="Thông tin khách hàng"
                  description="Thông tin dùng để xử lý đơn hàng và liên hệ khi cần."
                >
                  <CustomerInformationForm
                    value={
                      customer
                    }
                    errors={
                      errors
                    }
                    onChange={
                      onCustomerChange
                    }
                  />
                </CheckoutSection>

                <CheckoutSection
                  step={2}
                  title="Người nhận eSIM"
                  description="Mã QR eSIM sẽ được gửi đến email người nhận."
                >
                  <EsimRecipientForm
                    customer={
                      customer
                    }
                    value={
                      recipient
                    }
                    errors={
                      errors
                    }
                    onChange={
                      onRecipientChange
                    }
                  />
                </CheckoutSection>

                <CheckoutSection
                  step={3}
                  title="Phương thức thanh toán"
                  description="Chọn phương thức bạn muốn sử dụng cho đơn hàng."
                >
                  <PaymentMethodSelector
                    methods={
                      page.paymentMethods
                    }
                    value={
                      paymentMethod
                    }
                    errors={
                      errors
                    }
                    onChange={
                      onPaymentMethodChange
                    }
                  />
                </CheckoutSection>

                <CheckoutSection
                  step={4}
                  title="Xác nhận"
                  description={page.supportText}
                >
                  <TermsConfirmation
                    acceptTerms={
                      acceptTerms
                    }
                    termsLabel={
                      page.termsLabel
                    }
                    privacyLabel={
                      page.privacyLabel
                    }
                    errors={
                      errors
                    }
                    onChange={
                      onAcceptTermsChange
                    }
                  />
                </CheckoutSection>
              </div>

              <CheckoutOrderSummary
                page={
                  page
                }
                submitting={
                  submitting
                }
                onSubmit={
                  onSubmit
                }
              />
            </div>
          )}
        </Container>
      </Section>
    </PageShell>
  );
}
