'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
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
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { register } from "@/app/actions/auth";

const formSchema = z
    .object({
        username: z.string().min(2, {
            message: "Username must be at least 2 characters.",
        }),
        password: z.string().min(6, {
            message: "Password must be at least 6 characters.",
        }),
        verifyPassword: z.string().min(6, {
            message: "Password must be at least 6 characters.",
        }),
    })
    .superRefine(({ password, verifyPassword }, ctx) => {
        if (password !== verifyPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["verifyPassword"],
                message: "Passwords must match.",
            });
        }
    });

export default function Register() {
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
            verifyPassword: "",
        },
    });

    const handleRegister = async (values: z.infer<typeof formSchema>) => {
        try {
            await register({
                username: values.username,
                password: values.password
            });
            router.push('/product');
        } catch (error) {
            if (!(error instanceof Error && error.message.includes('NEXT_REDIRECT'))) {
                alert(error instanceof Error ? error.message : 'Login failed')
            }
        }
    };

    return (
        <div className="flex justify-center items-center h-full">
            <Card className="w-[450px]">
                <CardHeader>
                    <CardTitle>Register</CardTitle>
                    <CardDescription>Create an account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Username" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="verifyPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Verify Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button className="w-full" type="submit">Submit</Button>

                            <div className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <a href="/login" className="text-primary hover:underline">
                                    Login here
                                </a>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}