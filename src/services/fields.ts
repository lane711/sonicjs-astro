import type { ApiConfig } from '@/db/routes';

export const getFieldDefinitions = (tableConfig: ApiConfig, record?: any) => {
  const definitionObject = tableConfig.definition;

  // Convert the nested objects to an array
  const definitionArray = Object.values(definitionObject);

  const fields = Object.entries(tableConfig.fields ?? []);

  const formFields = definitionArray.map((field: any) => {
    const key = field.config.name;
    const fieldOverride = tableConfig.fields ? tableConfig.fields[key] : null;
    const fieldType = fieldOverride ? fieldOverride.type : 'textField';

    if (record && record[key]) {
      return {
        key,
        type: fieldType,
        value: record[key],
        readonly: key === 'userId'
      };
    } else {
      return { key, type: fieldType, readonly: key === 'userId' };
    }
  });

  return formFields;
};
