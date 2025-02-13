import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase";

interface AuthModalProps {
  trigger?: React.ReactNode;
}

export default function AuthModal({ trigger }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    newsletter: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegister) {
        await signUpWithEmail(formData.email, formData.password);
        toast({
          title: "Account created",
          description: formData.newsletter
            ? "Thanks for subscribing! Please check your email to verify your account."
            : "Please check your email to verify your account.",
        });
      } else {
        await signInWithEmail(formData.email, formData.password);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
      setIsOpen(false);
    } catch (error) {
      toast({
        title: isRegister ? "Registration failed" : "Sign in failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Sign In</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isRegister ? "Create Account" : "Sign In"}</DialogTitle>
          <DialogDescription>
            {isRegister
              ? "Create a new account to save your mixes"
              : "Sign in to access your saved mixes"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter"
              checked={formData.newsletter}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, newsletter: checked })
              }
            />
            <Label
              htmlFor="newsletter"
              className="text-sm text-muted-foreground leading-none cursor-pointer"
            >
              Keep me updated with news and updates from MixTube
            </Label>
          </div>
          <div className="flex justify-between items-center pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsRegister(!isRegister)}
              disabled={isLoading}
            >
              {isRegister ? "Have an account?" : "Need an account?"}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : isRegister ? "Create Account" : "Sign In"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}