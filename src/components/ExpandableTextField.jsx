import React, { useState, useRef, useEffect } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";

export default function ExpandableTextField({
  storageKey,
  rows = 4,
  value,
  onChange,
  placeholder,
  characterLimit = 0,
  ...props
}) {
  // Load the expanded state from localStorage
  const [expanded, setExpanded] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored === "true";
  });
  const [showToggle, setShowToggle] = useState(false);
  const textRef = useRef(null);

  // Check if the content overflows when not expanded
  useEffect(() => {
    if (textRef.current && !expanded) {
      const { scrollHeight, clientHeight } = textRef.current;
      setShowToggle(scrollHeight > clientHeight + 1);
    } else {
      // When expanded, always show the toggle so the user can collapse
      setShowToggle(true);
    }
  }, [value, expanded]);

  const handleToggle = () => {
    setExpanded((prev) => {
      const newVal = !prev;
      localStorage.setItem(storageKey, newVal.toString());
      return newVal;
    });
  };

  // When collapsed, we set a fixed number of rows and overflow auto.
  // When expanded, we let it auto-resize (using minRows as the minimum).
  const textFieldProps = expanded
    ? { multiline: true, minRows: rows }
    : { multiline: true, rows, InputProps: { style: { overflow: "auto" } } };

  return (
    <Box>
      <TextField
        {...textFieldProps}
        fullWidth
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputRef={textRef}
        {...props}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mt: 0.5,
          gap: 3,
        }}
      >
        {showToggle && (
          <Button size="small" onClick={handleToggle}>
            {expanded ? "Collapse field" : "Expand field"}
          </Button>
        )}
        {characterLimit > 0 && (
          <Typography
            variant="body2"
            sx={{
              textAlign: "right",
              color: value.length > characterLimit ? "red" : "text.secondary",
            }}
          >
            {value.length} / {characterLimit}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
