import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  NativeSelect,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import React, { ChangeEvent, useState } from "react";

export default function useDropDown(
  name: string,
  options: { content: string; value: any }[],
  defaultValue?: any
) {
  const [selectedValue, setSelectedValue] = useState(
    defaultValue || options[0].value
  );
  const id = `select-label-${name}`;

  const handleChange = (event: any) => {
    setSelectedValue(event.target.value as string);
  };

  function DropDown({
    fullWidth = false,
    sx = {},
  }: {
    fullWidth?: boolean;
    sx?: any;
  }) {
    const theme = useTheme();
    const small = useMediaQuery(theme.breakpoints.down("md"));

    return small ? (
      <FormControl fullWidth={fullWidth} sx={{ ...sx, mt: 3 }}>
        <InputLabel htmlFor={id}>{name}</InputLabel>
        <NativeSelect id={id} value={selectedValue} onChange={handleChange}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.content}
            </option>
          ))}
        </NativeSelect>
      </FormControl>
    ) : (
      <FormControl fullWidth={fullWidth}>
        <InputLabel id={id}>{name}</InputLabel>
        <Select
          labelId={id}
          id={`select-${name}`}
          value={selectedValue}
          label={name}
          onChange={handleChange}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.content}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return { DropDown, selectedValue, setSelectedValue };
}
