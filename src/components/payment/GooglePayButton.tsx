import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle, Loader2 } from 'lucide-react';

interface GooglePayButtonProps {
  amount: string; // e.g. "₹500/hr" - we'll parse the number
  serviceName: string;
  workerName: string;
  onPaymentSuccess: (paymentData: google.payments.api.PaymentData) => void;
  onPaymentError?: (error: Error) => void;
  disabled?: boolean;
}

// Google Pay configuration
const GOOGLE_PAY_BASE_REQUEST = {
  apiVersion: 2,
  apiVersionMinor: 0,
};

const ALLOWED_CARD_NETWORKS: google.payments.api.CardNetwork[] = [
  'AMEX', 'DISCOVER', 'MASTERCARD', 'VISA'
];

const ALLOWED_AUTH_METHODS: google.payments.api.CardAuthMethod[] = [
  'PAN_ONLY', 'CRYPTOGRAM_3DS'
];

const BASE_CARD_PAYMENT_METHOD: google.payments.api.IsReadyToPayPaymentMethodSpecification = {
  type: 'CARD',
  parameters: {
    allowedAuthMethods: ALLOWED_AUTH_METHODS,
    allowedCardNetworks: ALLOWED_CARD_NETWORKS,
  },
};

const TOKENIZATION_SPEC: google.payments.api.PaymentMethodTokenizationSpecification = {
  type: 'PAYMENT_GATEWAY',
  parameters: {
    gateway: 'example', // Replace with real gateway in production
    gatewayMerchantId: 'exampleGatewayMerchantId',
  },
};

const GooglePayButton = ({
  amount,
  serviceName,
  workerName,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}: GooglePayButtonProps) => {
  const [paymentsClient, setPaymentsClient] = useState<google.payments.api.PaymentsClient | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse amount from price string like "₹500/hr" or "₹300"
  const parseAmount = useCallback((): string => {
    const match = amount.match(/(\d+)/);
    return match ? match[1] + '.00' : '0.00';
  }, [amount]);

  // Load Google Pay script
  useEffect(() => {
    if (document.getElementById('google-pay-script')) {
      initGooglePay();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-pay-script';
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.async = true;
    script.onload = () => initGooglePay();
    script.onerror = () => {
      console.error('Failed to load Google Pay SDK');
      toast.error('Google Pay is not available');
    };
    document.head.appendChild(script);
  }, []);

  const initGooglePay = () => {
    if (typeof google === 'undefined' || !google.payments) return;

    const client = new google.payments.api.PaymentsClient({
      environment: 'TEST', // Change to 'PRODUCTION' for live
    });

    const isReadyToPayRequest = {
      ...GOOGLE_PAY_BASE_REQUEST,
      allowedPaymentMethods: [BASE_CARD_PAYMENT_METHOD],
    };

    client
      .isReadyToPay(isReadyToPayRequest)
      .then((response) => {
        if (response.result) {
          setPaymentsClient(client);
          setIsReady(true);
        }
      })
      .catch((err) => {
        console.error('Google Pay isReadyToPay error:', err);
      });
  };

  const handleGooglePay = async () => {
    if (!paymentsClient || isProcessing) return;

    setIsProcessing(true);

    const paymentDataRequest: google.payments.api.PaymentDataRequest = {
      ...GOOGLE_PAY_BASE_REQUEST,
      allowedPaymentMethods: [
        {
          ...BASE_CARD_PAYMENT_METHOD,
          tokenizationSpecification: TOKENIZATION_SPEC,
        },
      ],
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: parseAmount(),
        currencyCode: 'INR',
        countryCode: 'IN',
      },
      merchantInfo: {
        merchantName: 'Saath Services',
        // merchantId: 'YOUR_MERCHANT_ID', // Required in production
      },
    };

    try {
      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      toast.success('Payment successful!');
      onPaymentSuccess(paymentData);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Payment cancelled or failed');
      if ((err as { statusCode?: string })?.statusCode === 'CANCELED') {
        toast.info('Payment cancelled');
      } else {
        console.error('Google Pay error:', err);
        toast.error('Payment failed. Please try again.');
        onPaymentError?.(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Payment Summary */}
      <div className="p-4 bg-secondary rounded-xl space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Service</span>
          <span className="text-foreground font-medium">{serviceName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Professional</span>
          <span className="text-foreground font-medium">{workerName}</span>
        </div>
        <div className="border-t border-border my-2" />
        <div className="flex justify-between">
          <span className="text-foreground font-semibold">Total</span>
          <span className="text-primary font-bold text-lg">{amount}</span>
        </div>
      </div>

      {/* Google Pay Button */}
      {isReady ? (
        <button
          onClick={handleGooglePay}
          disabled={disabled || isProcessing}
          className="w-full h-12 rounded-xl bg-foreground text-background font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <svg viewBox="0 0 40 24" className="h-5 w-auto" aria-label="Google Pay">
                <path d="M19.656 11.297c0-.744-.063-1.298-.2-1.867h-7.93v3.39h4.604c-.094.78-.6 1.955-1.724 2.744l-.016.103 2.503 1.94.173.017c1.594-1.472 2.514-3.639 2.514-6.226l.076-.1z" fill="#4285F4"/>
                <path d="M11.526 19.5c2.334 0 4.293-.77 5.724-2.1l-2.66-2.06c-.755.52-1.766.888-3.064.888-2.34 0-4.327-1.55-5.035-3.68l-.098.008-2.603 2.015-.034.094C5.45 17.55 8.24 19.5 11.526 19.5z" fill="#34A853"/>
                <path d="M6.49 12.548a5.286 5.286 0 01-.286-1.698c0-.59.104-1.163.276-1.698l-.005-.11L3.84 6.99l-.085.04A8.646 8.646 0 002.75 10.85c0 1.394.334 2.713.927 3.88l2.813-2.182z" fill="#FBBC05"/>
                <path d="M11.526 5.472c1.614 0 2.703.697 3.323 1.28l2.425-2.367C15.81 2.963 13.86 2 11.526 2 8.24 2 5.45 3.95 3.755 6.89l2.735 2.16c.716-2.13 2.695-3.578 5.036-3.578z" fill="#EB4335"/>
              </svg>
              Pay with Google Pay
            </>
          )}
        </button>
      ) : (
        <div className="text-center py-3">
          <p className="text-sm text-muted-foreground">Loading Google Pay...</p>
        </div>
      )}

      {/* Fallback / Skip Payment */}
      <Button
        variant="ghost"
        className="w-full text-muted-foreground"
        onClick={() => onPaymentSuccess({} as google.payments.api.PaymentData)}
        disabled={disabled || isProcessing}
      >
        Pay after service (Cash)
      </Button>

      <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
        <CheckCircle className="w-3 h-3 text-primary" />
        Secure payment powered by Google Pay
      </p>
    </div>
  );
};

export default GooglePayButton;
