import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Function to handle event change
  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };
  // Function to handle form submission
  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/login",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Allow credentails (cookies) with request
        }
      );
      // Check if login was successful
      if (res.data.success) {
        navigate("/");
        // Show success message
        toast.success(res.data.message);
        // clear the form fields after a successful signup. making the form ready for a new user to log in
        setInput({ email: "", password: "" });
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
        onSubmit={loginHandler}
        className="shadow-lg flex flex-col gap-5 p-8"
      >
        <div className="my-4 text-center">
          <h1 className="text-xl font-bold">LOGO</h1>
          <p>Login to see videos and photos from your friends.</p>
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
        {loading ? (
          <Button>
            <Loader2 className="mr-2 h-2 w-4 animate-spin" />
          </Button>
        ) : (
          <Button type="submit" disabled={loading}>
            Login
          </Button>
        )}
        <span>
          Doesn't have an account?{" "}
          <Link className="text-blue-500" to="/signup">
            Sign Up
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Login;
