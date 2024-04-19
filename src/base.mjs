/**
 *
 */
export class Base {
  /* act like a Attribute */
  static get writable() {
    return true;
  }

  static get mandatory() {
    return true;
  }

  static get isKey() {
    return false;
  }

  static get isForeign() {
    return true;
  }

  /**
   * Attribute definitions.
   * @return {Object}
   */
  static get attributes() {
    return {};
  }

  /**
   * Maping of attribute names from internal (javascript) to external (database).
   * @return {Object}
   */
  static get attributeNameMapping() {
    return {};
  }

  /**
   * Attribute names on the javascript side.
   * @return {string[]}
   */
  static get attributeNames() {
    return Object.keys(this.attributes);
  }

  /**
   * Attribute names on the javascript side.
   * @return {string[]}
   */
  get attributeNames() {
    // @ts-ignore
    return this.constructor.attributeNames;
  }

  /**
   * Object keys are the mapped external attribute names.
   * @return {Object}
   */
  _getAttributes(mapping) {
    const values = {};

    for (const key of this.attributeNames) {
      if (this[key] !== undefined) {
        if (mapping[key] !== null) {
          values[mapping[key] || key] = this[key];
        }
      }
    }

    for (const [exp, key] of Object.entries(mapping)) {
      if (key !== null) {
        const path = exp.split(/\./);
        const last = path.pop();

        let o = this;
        for (const k of path) {
          o = o[k];
        }

        // @ts-ignore
        if (o?.[last] !== undefined) {
          // @ts-ignore
          values[key] = o[last];
        }
      }
    }

    return values;
  }

  getAttributes() {
    // @ts-ignore
    return this._getAttributes(this.constructor.attributeNameMapping);
  }

  /**
   * Object keys are the mapped external attribute names but only for local (not isForeign) ones.
   * @return {Object}
   */
  getLocalAttributes(mapping = {}) {
    // @ts-ignore
    const attributes = this.constructor.attributes;

    const values = this._getAttributes(mapping);
    for (const k of Object.keys(values)) {
      if (attributes[k]?.isForeign) {
        delete values[k];
      }
    }
    return values;
  }

  /**
   * Sets values with external attribute names.
   * @param {Object} values
   */
  setAttributes(values) {
    if (values) {
      // @ts-ignore
      const attributes = this.constructor.attributes;

      // @ts-ignore
      const mapping = this.constructor.attributeNameMapping;

      for (const name of this.attributeNames) {
        let value = values[mapping[name] || name];

        if (value === undefined) {
          /*     if(this[name] !== undefined) {
            this[name] = value;
          }*/
        } else {
          if (typeof value === "string") {
            if (attributes[name]?.type === "timestamp") {
              value = new Date(value);
            }
          }

          this[name] = value;
        }
      }
    }
  }

  /**
   * @return {string}
   */
  get type() {
    // @ts-ignore
    return this.constructor.type;
  }

  toJSON() {
    const values = this.getLocalAttributes();
    for (const [k, v] of Object.entries(values)) {
      if (v instanceof Date) {
        values[k] = v.toISOString();
      }
    }
    return values;
  }
}
