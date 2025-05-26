import React, { forwardRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

// Enregistrer la locale française
registerLocale("fr", fr);

type DatePickerWrapperProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  required?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  error?: string;
  [x: string]: any; // Pour permettre les autres props de DatePicker
};

// Composant personnalisé pour l'input du DatePicker
const CustomInput = forwardRef<HTMLInputElement, any>(
  (
    {
      value,
      onClick,
      placeholder,
      onChange,
      onBlur,
      onFocus,
      className,
      disabled,
      required,
      id,
      name,
      error,
    },
    ref
  ) => (
    <div className="relative">
      <input
        ref={ref}
        value={value}
        onChange={onChange}
        onClick={onClick}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        className={`w-full p-3 border ${
          error ? "border-red-500" : "border-sage/30"
        } rounded-lg focus:ring-sage focus:border-sage bg-offwhite text-brown ${
          className || ""
        }`}
        disabled={disabled}
        required={required}
        id={id}
        name={name}
        readOnly
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-brown/60"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  )
);

const DatePickerWrapper: React.FC<DatePickerWrapperProps> = ({
  value,
  onChange,
  label,
  required = false,
  id,
  name,
  placeholder = "Sélectionnez une date",
  error,
  ...props
}) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={id || name}
          className="block text-brown font-semibold mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <DatePicker
        selected={value}
        onChange={onChange}
        customInput={
          <CustomInput
            id={id}
            name={name}
            required={required}
            placeholder={placeholder}
            error={error}
          />
        }
        locale="fr"
        dateFormat="dd/MM/yyyy"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        todayButton="Aujourd'hui"
        previousMonthButtonLabel="Mois précédent"
        nextMonthButtonLabel="Mois suivant"
        ariaLabelledBy={id || name}
        {...props}
      />

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default DatePickerWrapper;
