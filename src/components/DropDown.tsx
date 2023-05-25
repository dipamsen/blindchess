import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import React, { useState } from "react";

export default function useDropDown(
  name: string,
  options: { content: string; value: any }[],
  defaultValue: any
) {
  const [selectedValue, setSelectedValue] = useState(
    defaultValue || options[0].value
  );
  const id = `select-label-${name}`;

  const handleChange = (event: SelectChangeEvent<{ value: unknown }>) => {
    setSelectedValue(event.target.value as string);
  };

  function DropDown() {
    return (
      <FormControl fullWidth>
        <InputLabel id={id}>{name}</InputLabel>
        <Select
          labelId={id}
          id={`select-${name}`}
          value={selectedValue}
          label={name}
          onChange={handleChange}
        >
          {options.map((option) => (
            <MenuItem value={option.value}>{option.content}</MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return { DropDown, selectedValue, setSelectedValue };
}
