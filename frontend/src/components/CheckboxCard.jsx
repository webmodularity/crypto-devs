import React from "react";
import { Box, useCheckbox } from "@chakra-ui/react";

// Adapted from https://codesandbox.io/s/xifkm
function CheckboxCard(props) {
    const { getInputProps, getCheckboxProps } = useCheckbox(props);

    const input = getInputProps();
    const checkbox = getCheckboxProps();

    return (
        <Box as="label">
            <input {...input} />
            <Box
                {...checkbox}
                fontSize="14px"
                cursor="pointer"
                borderWidth="1px"
                borderRadius="md"
                boxShadow="md"
                _checked={{
                    bg: "brand.500",
                    color: "white"
                }}
                _hover={{
                    bg: "brand.300",
                    transition: ".5s"
                }}
                px={5}
                py={3}
                _disabled={{
                    bg: "gray.300"
                }}
            >
                {props.children}
            </Box>
        </Box>
    );
}

export default CheckboxCard;