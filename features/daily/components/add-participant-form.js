"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAddParticipant } from "@/features/daily/api/use-add-participant";
import { addParticipantSchema } from "@/features/daily/schemas";

export const AddParticipantForm = ({ room }) => {
  const { mutate: addParticipant, isPending } = useAddParticipant();

  const form = useForm({
    resolver: zodResolver(addParticipantSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values) => {
    addParticipant(
      {
        name: values.name,
        roomCode: room.code,
      },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Join the conversation
        </h2>
        <p className="text-gray-600 max-w-md">
          Enter your name to participate in today&apos;s question.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-sm space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your name"
                    className="text-center text-lg py-3"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full py-3 font-semibold text-base"
            disabled={isPending}
          >
            {isPending ? "Joining..." : "Join Room"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
