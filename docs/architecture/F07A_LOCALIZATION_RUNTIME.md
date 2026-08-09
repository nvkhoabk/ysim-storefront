<!-- F07A-2A_STATIC_LOCALIZATION_R1 -->

# F07A-2A Static Localization Runtime Foundation

## Scope

This package adds a static localization runtime for the three configured YSim markets:

- Vietnamese (`vi`) with VND
- English (`en`) with USD
- Lao (`lo`) with LAK

It does not activate public locale routing and does not modify the production root layout, header, footer, cart, checkout, payment, WordPress, WooCommerce, GPay, or Gigago.

## Dictionary model

Translations are split into four namespaces:

- `common`
- `navigation`
- `market`
- `validation`

Vietnamese is the reference and fallback locale. All locale dictionaries must contain identical namespaces, keys, and placeholder names.

## Validation rules

The registry rejects:

- missing or extra locales
- missing or extra namespaces
- missing or extra translation keys
- empty values
- HTML tags in translation values
- placeholder mismatches

## Runtime behavior

Development mode:

- a missing key throws an error
- a missing interpolation value throws an error

Production mode:

- a missing locale key falls back to Vietnamese
- if the Vietnamese key is also missing, the key itself is returned
- missing interpolation values remain visible as placeholders

## Client and server use

Server Components may call `loadMessages()` and `createTranslator()`.

Client Components receive locale messages through `I18nProvider` and call `useTranslations()`.

## Preview route

The package adds only this preview route:

```text
/ui-preview/localization?locale=vi
/ui-preview/localization?locale=en
/ui-preview/localization?locale=lo
```

The preview route is already excluded from market-routing redirects.

## Activation boundary

Public market routing remains disabled until the production shell and commerce routes have been localized and currency presentation has been implemented.
