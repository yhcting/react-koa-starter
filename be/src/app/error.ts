import {
	Err as ErrBase,
	a,
	ethrow
} from './coreut/error';
export { a, ethrow };
export { isErrInstance } from '../fbs/error';
export { E } from '../fbs/dto/cmmn';
import { E } from '../fbs/dto/cmmn';

export class Err extends ErrBase<E> {
}
