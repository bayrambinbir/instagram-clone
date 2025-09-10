import React from "react";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

const Signup = () => {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <form className="shadow-lg flex flex-col gap-5 p-8">
        <div className="my-4 text-center">
          <h1 className="text-xl font-bold">LOGO</h1>
          <p>Sign up to see videos and photos from your friends.</p>
        </div>
        <div>
          <Label htmlFor="Username" className="mb-1">
            Username
          </Label>
          <Input type="text" name="username" />
        </div>
        <div>
          <Label htmlFor="Email" className="mb-1">
            Email
          </Label>
          <Input type="text" name="email" />
        </div>
        <div>
          <Label htmlFor="Password" className="mb-1">
            Password
          </Label>
          <Input type="password" name="password" />
        </div>
        <Button type="submit">Sign Up</Button>
      </form>
    </div>
  );
};

export default Signup;
