import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import "./admin-login.page.scss";

interface AdminLoginPageProps {
  onLogin: (username: string, password: string) => void;
}

export default function AdminLoginPage({ onLogin }: AdminLoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle>Admin Portal</CardTitle>
          <CardDescription>
            Enter your credentials to access the management console.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
            />
          </div>
          <Button
            onClick={() => onLogin(username, password)}
            className="w-full"
          >
            Sign in
          </Button>
          <p className="text-xs text-slate-500 text-center mt-4">
            Demo credentials: admin / admin123
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
