import { Locale } from '@/types';

export const enUS = {
  name: 'enUS',
  ERROR: {
    CONFIG: {
      INVALID_AXIOS_REF: `
        Invalid configuration: refAxios must be either an Axios instance or a factory function that returns an Axios instance.
      `,
      INVALID_PATH_PARAM_TYPE: `
         Illegal configuration: The path parameter pathParams must be an object whose keys must be strings and values must be strings or numbers (non-empty string values must consist of digits, letters, or underscores).
      `,
      INVALIED_PATH_PARAM: `
        Invalid configuration: pathParams must be an object, and property values cannot contain special characters like [?=.: ] etc.
      `,
      MISSING_AXIOS_REF: `Configuration missing: At least one of the @Api class decorator or @{{fnName}} method decorator must provide a reference to an axios instance.`,
    },
    DECORATOR: {
      INVALID_POSITION: `
        Invalid decoration position: {{decorator}} decorator can only be used on {{position}}.
      `,
      MISSING_IDENTIFIER: `
        Missing identifier: {{identifier}} parameter is required.
      `,
      INSTANCE_NOT_FOUND: `
        Instance not found: No instance found for {{identifier}}.
      `,
      INSTANCE_ALREADY_REGISTERED: `
        Instance already registered: An instance for {{identifier}} has already been registered.
      `,
      REPEATED_DECORATION: `
      Repeated decoration: {{identifier}} has already been decorated by the {{decorator}} decorator and cannot be repeatedly decorated.
      `,
      REPEATED_PARAMS: `
      Duplicate parameters: The @{{x2}} annotation for method {{x1}} contains repeated parameter aliases ({{x3}}). @PathParams and @QueryParams decorators do not allow duplicate parameter aliases.
      `,
      INVALID_PATH_PARAM_TYPE: `
      Illegal parameter: Path parameter values can only be strings, numbers, or boolean types, and strings must consist of digits, letters, or underscores.
      `,
    },
    SYSTEM: {
      INVALIED_ENVIRONMENT: `
        Invalid environment: {{env}} is not a valid environment. Expected environments are {{expect}}.
      `,
    },
    I18N: {
      INVALID_EXPRESSION: `
        i18n: Translation key not found: {{key}} (Current locale: {{locale}}). Please check if the expression is correct.
      `,
      RESULT_NOT_STRING: `
        i18n: Translated value is not a string (Actual type: {{translation}}). Please check if the expression is complete or if the current locale supports this expression.
      `,
      NO_LANG_ENV: `
       i18n: No locale found for '{{localeName}}'. Please check if the locale name is correct. If this locale truly doesn't exist, we welcome you to become an internationalization contributor!
      `,
    },
  },
};
