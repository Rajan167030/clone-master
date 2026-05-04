import Handlebars from 'handlebars';

export const renderTemplate = (html, variables = {}) => {
  try {
    const template = Handlebars.compile(String(html || ''));
    return template(variables || {});
  } catch (err) {
    throw new Error(`Template render error: ${err?.message || err}`);
  }
};

export default { renderTemplate };
