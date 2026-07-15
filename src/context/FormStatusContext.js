"use client";
import { createContext, useContext } from "react";

export const FormStatusContext = createContext({
  formStatus: "",
  setFormStatus: () => {},
});

export const useFormStatus = () => useContext(FormStatusContext);
