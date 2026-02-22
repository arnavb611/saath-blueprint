declare namespace google.payments.api {
  type CardNetwork = 'AMEX' | 'DISCOVER' | 'INTERAC' | 'JCB' | 'MASTERCARD' | 'VISA';
  type CardAuthMethod = 'PAN_ONLY' | 'CRYPTOGRAM_3DS';
  type Environment = 'TEST' | 'PRODUCTION';
  type TotalPriceStatus = 'NOT_CURRENTLY_KNOWN' | 'ESTIMATED' | 'FINAL';

  interface IsReadyToPayPaymentMethodSpecification {
    type: string;
    parameters: {
      allowedAuthMethods: CardAuthMethod[];
      allowedCardNetworks: CardNetwork[];
    };
  }

  interface PaymentMethodTokenizationSpecification {
    type: string;
    parameters: Record<string, string>;
  }

  interface PaymentDataRequest {
    apiVersion: number;
    apiVersionMinor: number;
    allowedPaymentMethods: Array<
      IsReadyToPayPaymentMethodSpecification & {
        tokenizationSpecification: PaymentMethodTokenizationSpecification;
      }
    >;
    transactionInfo: {
      totalPriceStatus: TotalPriceStatus;
      totalPrice: string;
      currencyCode: string;
      countryCode?: string;
    };
    merchantInfo: {
      merchantName: string;
      merchantId?: string;
    };
  }

  interface PaymentData {
    apiVersion: number;
    apiVersionMinor: number;
    paymentMethodData: {
      type: string;
      description: string;
      tokenizationData: {
        type: string;
        token: string;
      };
    };
  }

  interface IsReadyToPayResponse {
    result: boolean;
  }

  class PaymentsClient {
    constructor(config: { environment: Environment });
    isReadyToPay(request: {
      apiVersion: number;
      apiVersionMinor: number;
      allowedPaymentMethods: IsReadyToPayPaymentMethodSpecification[];
    }): Promise<IsReadyToPayResponse>;
    loadPaymentData(request: PaymentDataRequest): Promise<PaymentData>;
  }
}
