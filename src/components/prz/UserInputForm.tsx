'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { runPrzPipeline, type PrzPipelineOutput } from '@/app/actions';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/prz/LoadingSpinner';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  request: z.string().min(10, { message: 'Please enter a request of at least 10 characters.' }),
});

interface UserInputFormProps {
  setIsLoading: (isLoading: boolean) => void;
  setResult: (result: PrzPipelineOutput | null) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
}

export function UserInputForm({ setIsLoading, setResult, setError, isLoading }: UserInputFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      request: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await runPrzPipeline({ userRequest: data.request });
      setResult(response);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const exampleRequests = [
    "Generate a Python script to analyze a CSV file and create a bar chart.",
    "Fix a syntax error in `src/ai/flows/prz-validation.ts`. The error was ```json in a template literal.",
    "Draft an email to my team about the new project deadline.",
    "Audit the application code for improvements.",
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="request"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Enter your task or request here..."
                  className="min-h-[120px] resize-none text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-xs text-muted-foreground">
          Try an example:
          <div className="flex flex-wrap gap-2 mt-2">
            {exampleRequests.map((req, i) => (
              <button
                key={i}
                type="button"
                onClick={() => form.setValue('request', req)}
                className="px-2 py-1 border rounded-md text-xs hover:bg-accent"
              >
                "{req.substring(0,40)}..."
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={isLoading} size="lg" className="w-full font-semibold">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Run PRZ Pipeline
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
