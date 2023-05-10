import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import React from "react";
import { useForm } from "react-hook-form";
import { useHistory, useLocation } from "react-router-dom";

import { LoadingSpinner } from "../../../app/components/LoadingSpinner";
import { useWillUnmount } from "../../../app/hooks/useWillUnmount";
import { useAppDispatch } from "../../../app/store/hooks";
import { useUser } from "../hooks/useUser";
import { cancelSignIn, signInRequest } from "../redux/authSlice";
import { AuthenticateAction, SignInDetails } from "../types";

interface FormField {
  display: string;
  name: string;
  default: string;
}

export function SignIn(): React.ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { user, signInStatus } = useUser();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation();

  const from =
    location.state && location.pathname !== "/"
      ? location.state.from
      : { pathname: "/profile" };

  React.useEffect(() => {
    if (user?.id) {
      history.replace(from);
    }
  }, [user]);

  const onSubmit = (data: SignInDetails, action: AuthenticateAction) =>
    dispatch(signInRequest({ ...data, action }));
  const handleSignIn = handleSubmit((data: SignInDetails) =>
    onSubmit(data, "signIn")
  );
  const handleSignUp = handleSubmit((data: SignInDetails) =>
    onSubmit(data, "signUp")
  );

  useWillUnmount(() => {
    if (signInStatus === "pending") {
      dispatch(cancelSignIn());
    }
  });

  const formFields: Array<FormField> = [
    { name: "email", display: "Email address", default: "test@test.com" },
    { name: "password", display: "Password", default: "test" },
  ];

  return (
    <>
      <Flex minH="84vh" align="center" justify="center">
        <Stack spacing={8} mx="auto" py={6} px={6}>
          <Stack alignSelf="center">
            <Heading>Sign in to your account</Heading>
          </Stack>
          <Box
            rounded="lg"
            bg="gray.50"
            color="gray.900"
            boxShadow="lg"
            maxW="lg"
            minW="lg"
            p={8}
            alignSelf="center"
          >
            <Stack spacing={4}>
              <form data-testid="sign-in-form">
                {formFields.map((field) => (
                  <FormControl key={field.name} id={field.name} isRequired>
                    <FormLabel>{field.display}</FormLabel>
                    <Input
                      borderColor="gray.700"
                      type={field.name}
                      defaultValue={field.default}
                      mb={4}
                      {...register(field.name, {
                        required: true,
                      })}
                    />
                    {errors[field.name] && (
                      <FormErrorMessage>
                        {field.display} is required
                      </FormErrorMessage>
                    )}
                  </FormControl>
                ))}
                <Flex
                  mt={4}
                  justifyContent="flex-end"
                  style={{ fontFamily: "Unica One" }}
                >
                  <Button mr={2} variant="outline" onClick={handleSignUp}>
                    Sign up
                  </Button>
                  <Button bgColor="gray.300" onClick={handleSignIn}>
                    Sign in
                  </Button>
                </Flex>
              </form>
            </Stack>
          </Box>
          <LoadingSpinner display={signInStatus === "pending"} />
        </Stack>
      </Flex>
    </>
  );
}
