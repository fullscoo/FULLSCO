import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Course } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2 } from "lucide-react";

const paymentFormSchema = z.object({
  cardNumber: z.string().refine((val) => /^\d{16}$/.test(val), {
    message: "Card number must be 16 digits",
  }),
  cardholderName: z.string().min(3, {
    message: "Cardholder name must be at least 3 characters",
  }),
  expiryMonth: z.string().min(1, {
    message: "Required",
  }),
  expiryYear: z.string().min(1, {
    message: "Required",
  }),
  cvv: z.string().refine((val) => /^\d{3,4}$/.test(val), {
    message: "CVV must be 3 or 4 digits",
  }),
  saveCard: z.boolean().optional(),
});

interface PaymentFormProps {
  course: Course;
  onSuccess?: () => void;
}

const PaymentForm = ({ course, onSuccess }: PaymentFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardNumber: "",
      cardholderName: user?.fullName || "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      saveCard: false,
    },
  });
  
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/enrollments", {
        courseId: course.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment successful",
        description: `You are now enrolled in ${course.title}`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
      setIsSuccess(true);
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    },
    onError: (error) => {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof paymentFormSchema>) => {
    // In a real app, this would call a payment processing API
    console.log("Payment data:", data);
    
    // Simulate a payment processing delay
    setTimeout(() => {
      // After payment is processed, enroll the user in the course
      enrollMutation.mutate();
    }, 1500);
  };
  
  const formatCardNumber = (value: string) => {
    return value.replace(/\D/g, "").substring(0, 16);
  };
  
  const formatCVV = (value: string) => {
    return value.replace(/\D/g, "").substring(0, 4);
  };
  
  // Generate arrays for month and year options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString(), label: month.toString().padStart(2, "0") };
  });
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear + i;
    return { value: year.toString(), label: year.toString() };
  });
  
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4 text-center">
          Thank you for your payment. You now have access to "{course.title}".
        </p>
        <Button onClick={onSuccess}>Start Learning</Button>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Enter your card information to complete your purchase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        {...field}
                        onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                        disabled={enrollMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        disabled={enrollMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="expiryMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Month</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={enrollMutation.isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="expiryYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Year</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={enrollMutation.isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="YYYY" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year.value} value={year.value}>
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-1">
                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123"
                            {...field}
                            onChange={(e) => field.onChange(formatCVV(e.target.value))}
                            disabled={enrollMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="saveCard"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={enrollMutation.isPending}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Save card for future payments</FormLabel>
                      <FormDescription>
                        We will securely store your card information for faster checkout.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Course price</span>
                <span>${course.price.toFixed(2)}</span>
              </div>
              {course.discountPrice && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-${(course.price - course.discountPrice).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${(course.discountPrice || course.price).toFixed(2)}</span>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={enrollMutation.isPending}
            >
              {enrollMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay ${(course.discountPrice || course.price).toFixed(2)}</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>Secure payment processing</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PaymentForm;
