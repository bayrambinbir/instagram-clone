import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";

const Signup = () => {
  // State to handle form input values (username, email, password)
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  // Function to handle event change
  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };
  // Function to handle form submission
  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/register",
        input,
        {
          headers: {
            "Content-Type": "application/json",
            withCredentails: true, // Allow credentails (cookies) with request
          },
        }
      );
      // Check if regsitration was successful
      if (res.data.success) {
        // Show success message
        toast.success(res.data.message);
        // clear the form fields after a successful signup. making the form ready for a new user to sign up
        setInput({ username: "", email: "", password: "" });
      }
    } catch (error) {
      console.log(error);
      // Show error message
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <form
        onSubmit={signupHandler}
        className="shadow-lg flex flex-col gap-5 p-8"
      >
        <div className="my-4 text-center">
          <h1 className="text-xl font-bold">LOGO</h1>
          <p>Sign up to see videos and photos from your friends.</p>
        </div>
        <div>
          <Label htmlFor="Username" className="mb-1">
            Username
          </Label>
          <Input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
          />
        </div>
        <div>
          <Label htmlFor="Email" className="mb-1">
            Email
          </Label>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
          />
        </div>
        <div>
          <Label htmlFor="Password" className="mb-1">
            Password
          </Label>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
          />
        </div>
        <Button type="submit" disable={loading}>
          {loading ? "Sign up..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
};

export default Signup;
