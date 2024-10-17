export const getFieldDefinitions = (tableConfig) => {
  const definitionObject = tableConfig.definition;

  // Convert the nested objects to an array
  const definitionArray = Object.values(definitionObject);

  const fields = Object.entries(tableConfig.fields ?? []);

  const formFields = definitionArray.map((field) => {
    const key = field.config.name;
    const fieldOverride = tableConfig.fields ? tableConfig.fields[key] : null;
    if (fieldOverride) {
      return { key, type: fieldOverride };
    } else {
      return { key, type: "textField" };
    }
  });

  tableConfig.formFields = formFields;
  console.log("formFields", formFields);
  return tableConfig;
};
