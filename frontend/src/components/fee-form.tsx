import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Axios } from "../lib/utils";
import { useState } from "react";

const deliveryLocationSchema = z
  .object({
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
  })
  .required();

export function CalculateDistanceFee({
  location,
}: {
  location?: { latitude: number; longitude: number };
}) {
  console.log(location)
  const [deliveryOptions, setOptions] = useState<{
    fee: number;
    distance: number;
  } | null>(null);
  const form = useForm<z.infer<typeof deliveryLocationSchema>>({
    resolver: zodResolver(deliveryLocationSchema),
    defaultValues: {
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
    },
  });

  async function onSubmit(values: z.infer<typeof deliveryLocationSchema>) {
    console.log(values);
    try {
      const res = await Axios.post("delivery/fee", values);
      setOptions({
        distance: res.data.distance,
        fee: res.data.fee,
      });
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="w-full max-w-sm flex flex-col gap-2 bg-slate-100">
        <CardHeader>
          <CardTitle className="text-2xl">Delivery Fee</CardTitle>
          {/* <CardDescription className="text-xs">
            Input longitude and latitude of wholesaler/manufacuter's location to
            get the delivery fee.
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input placeholder="5.3336" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input placeholder="4.2465" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mt-4 text-center text-sm">
                <p className="font-medium">Fee = 2000 PER KM</p>
                {deliveryOptions && (
                  <div className="">
                    <p>Distance: {deliveryOptions.distance}</p>
                    <p>Fee: {deliveryOptions.fee}</p>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full cursor-pointer">
                Calculate
              </Button>
            </form>
          </Form>
        </CardContent>
    </div>
  );
}
