"use client";
import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


export default function Calendar23({ value, onDateChange }) {
  const rangeToDate = (range) => {
    if (!range) return undefined;
    return new Date(range.year, range.month - 1, range.day);
  };

  const [range, setRange] = React.useState({
    from: value?.from ? rangeToDate(value.from) : undefined,
    to: value?.to ? rangeToDate(value.to) : undefined
  });

  const handleSelect = (range) => {
    setRange(range);
    onDateChange(range);
  };

  return (
    <div className="flex flex-col gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" id="dates" className="w-56 justify-between font-normal">
            {range?.from && range?.to
              ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
              : "Выберите даты"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            captionLayout="dropdown"
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
