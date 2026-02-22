import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { X, Clock, CalendarDays, CheckCircle, ArrowLeft } from 'lucide-react';
import GooglePayButton from '@/components/payment/GooglePayButton';

interface BookingSchedulerProps {
  worker: {
    id: string;
    name: string;
    service: string;
    price: string;
    photo: string | null;
  };
  onConfirm: (scheduledAt: Date) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM',
];

const BookingScheduler = ({ worker, onConfirm, onCancel, isLoading }: BookingSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookNow, setBookNow] = useState(true);
  const [step, setStep] = useState<'schedule' | 'payment'>('schedule');

  const getScheduledDate = (): Date => {
    if (bookNow) return new Date();
    
    const [time, period] = selectedTime!.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    
    const scheduledDate = new Date(selectedDate!);
    scheduledDate.setHours(hour24, minutes, 0, 0);
    return scheduledDate;
  };

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePaymentSuccess = () => {
    onConfirm(getScheduledDate());
  };

  const isValidSelection = bookNow || (selectedDate && selectedTime);

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass rounded-3xl p-6 shadow-3d animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {step === 'payment' && (
              <Button variant="ghost" size="icon" onClick={() => setStep('schedule')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h2 className="text-xl font-bold text-foreground">
              {step === 'schedule' ? 'Schedule Booking' : 'Payment'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Worker Info */}
        <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl mb-6">
          <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center overflow-hidden">
            {worker.photo ? (
              <img src={worker.photo} alt={worker.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{worker.name}</h3>
            <p className="text-sm text-primary">{worker.service}</p>
            <p className="text-sm text-muted-foreground">{worker.price}</p>
          </div>
        </div>

        {step === 'schedule' ? (
          <>
            {/* Booking Type Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setBookNow(true)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  bookNow
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Clock className={`w-6 h-6 mx-auto mb-2 ${bookNow ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className={`font-medium ${bookNow ? 'text-primary' : 'text-foreground'}`}>Book Now</p>
                <p className="text-xs text-muted-foreground">Instant booking</p>
              </button>
              <button
                onClick={() => setBookNow(false)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  !bookNow
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <CalendarDays className={`w-6 h-6 mx-auto mb-2 ${!bookNow ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className={`font-medium ${!bookNow ? 'text-primary' : 'text-foreground'}`}>Schedule</p>
                <p className="text-xs text-muted-foreground">Pick date & time</p>
              </button>
            </div>

            {/* Calendar & Time Selection */}
            {!bookNow && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Select Date</label>
                  <div className="bg-secondary rounded-xl p-2 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Select Time</label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === time
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80 text-foreground'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            {isValidSelection && (
              <div className="mt-6 p-4 bg-accent/10 rounded-xl">
                <div className="flex items-center gap-2 text-accent mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Booking Summary</span>
                </div>
                <p className="text-sm text-foreground">
                  {bookNow
                    ? 'Booking immediately - worker will be notified now'
                    : `Scheduled for ${selectedDate?.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} at ${selectedTime}`
                  }
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={handleProceedToPayment}
                disabled={!isValidSelection || isLoading}
              >
                Proceed to Payment
              </Button>
            </div>
          </>
        ) : (
          /* Payment Step */
          <GooglePayButton
            amount={worker.price}
            serviceName={worker.service}
            workerName={worker.name}
            onPaymentSuccess={handlePaymentSuccess}
            disabled={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default BookingScheduler;
