
import React, { useState } from "react";
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
import { useFirestoreUpdate, useFirestoreDelete } from "@/hooks/useFirestore";
import { Trash2, Edit3 } from "lucide-react";
import { format } from "date-fns";

const editEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  scheduledTime: z.string().min(1, "Time is required"),
});

type EditEventForm = z.infer<typeof editEventSchema>;

interface Event {
  id: string;
  title: string;
  description?: string;
  scheduledTime: string;
  date: string;
}

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export default function EditEventModal({ isOpen, onClose, event }: EditEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const updateEvent = useFirestoreUpdate('events');
  const deleteEvent = useFirestoreDelete('events');

  const form = useForm<EditEventForm>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      scheduledTime: event?.scheduledTime || "09:00",
    },
  });

  // Reset form when event changes
  React.useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        description: event.description || "",
        scheduledTime: event.scheduledTime,
      });
    }
  }, [event, form]);

  const handleModalChange = (open: boolean) => {
    if (!open) {
      setIsSubmitting(false);
      setIsDeleting(false);
      onClose();
    }
  };

  const onSubmit = async (data: EditEventForm) => {
    if (!event) return;
    
    setIsSubmitting(true);
    try {
      await updateEvent(event.id, {
        ...data,
        updatedAt: new Date(),
      });
      
      toast({
        title: "Event updated",
        description: "Your event has been updated successfully.",
        duration: 2000,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error updating event",
        description: "An error occurred while updating the event.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    
    setIsDeleting(true);
    try {
      await deleteEvent(event.id);
      
      toast({
        title: "Event deleted",
        description: "Your event has been deleted successfully.",
        duration: 2000,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error deleting event",
        description: "An error occurred while deleting the event.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!event) return null;

  const eventDate = new Date(event.date);

  return (
    <Dialog open={isOpen} onOpenChange={handleModalChange}>
      <DialogContent className="sm:max-w-lg bg-white border border-gray-200" data-testid="modal-edit-event">
        <DialogHeader>
          <DialogTitle className="text-text-primary flex items-center">
            <Edit3 className="mr-2 h-5 w-5" />
            Edit Event
          </DialogTitle>
          <p className="text-sm text-text-muted mt-1">
            {format(eventDate, 'EEEE, MMMM d, yyyy')}
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
                      data-testid="input-edit-event-title"
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
                      data-testid="input-edit-event-description"
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
                      data-testid="input-edit-event-time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="flex items-center"
                data-testid="button-delete-event"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  data-testid="button-cancel-edit-event"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className="bg-text-primary text-white hover:bg-gray-800"
                  data-testid="button-update-event"
                >
                  {isSubmitting ? "Updating..." : "Update Event"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
