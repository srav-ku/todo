
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreAdd } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const newEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  scheduledTime: z.string().min(1, "Time is required"),
});

type NewEventForm = z.infer<typeof newEventSchema>;

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

export default function NewEventModal({ isOpen, onClose, selectedDate }: NewEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const addEvent = useFirestoreAdd('events');

  const form = useForm<NewEventForm>({
    resolver: zodResolver(newEventSchema),
    defaultValues: {
      title: "",
      description: "",
      scheduledTime: "09:00",
    },
  });

  // Reset form when modal opens/closes
  const handleModalChange = (open: boolean) => {
    if (!open) {
      setIsSubmitting(false);
      form.reset();
      onClose();
    }
  };

  const onSubmit = async (data: NewEventForm) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await addEvent({
        ...data,
        date: selectedDate.toISOString().split('T')[0],
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      toast({
        title: "Event created",
        description: "Your new event has been created successfully.",
        duration: 2000,
      });
      
      // Reset form and close modal
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error creating event",
        description: "An error occurred while creating the event.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalChange}>
      <DialogContent className="sm:max-w-lg bg-white border border-gray-200" data-testid="modal-new-event">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Add New Event</DialogTitle>
          <p className="text-sm text-text-muted mt-1">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter event title"
                      {...field}
                      data-testid="input-event-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter event description"
                      rows={3}
                      {...field}
                      data-testid="input-event-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      data-testid="input-event-time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel-event"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-text-primary text-white hover:bg-gray-800"
                data-testid="button-create-event"
              >
                {isSubmitting ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
