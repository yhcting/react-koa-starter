/**
 * Module for type checking
 */
import joi from 'joi';

export function validate(v: any, schema: joi.Schema) {
	return schema.validate(v, {convert: false}).error === null;
}

export function object(v: any): boolean {
	// Using Joi is wastefully slow.
	return 'object' === typeof v
		&& null !== v
		&& !Array.isArray(v);
}

