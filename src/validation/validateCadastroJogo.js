/** @typedef {{ field: string, code: string, message: string }} ValidationError */

const STATUS = new Set(['nao_iniciado', 'jogando', 'zerado']);
const TIPO_MIDIA = new Set(['fisica', 'digital']);
const LICENCA_TIPO = new Set(['compra', 'assinatura', 'resgate_codigo']);
const STATUS_LICENCA = new Set(['ativa', 'expirada', 'removida']);
const FORMATO_FISICO = new Set(['disco', 'cartucho', 'colecionador']);
const ESTADO_MIDIA = new Set(['novo', 'semi_novo', 'usado']);

const DIGITAL_KEYS = new Set(['lojaDigital', 'licencaTipo', 'statusLicenca']);
const FISICA_KEYS = new Set(['formatoFisico', 'estadoMidia', 'regiao']);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @param {unknown} body
 * @returns {ValidationError[]}
 */
export function validateCadastroJogo(body) {
  /** @type {ValidationError[]} */
  const errors = [];

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    errors.push({
      field: 'body',
      code: 'INVALID_TYPE',
      message: 'O corpo da requisição deve ser um objeto JSON.',
    });
    return errors;
  }

  const b = /** @type {Record<string, unknown>} */ (body);

  if (Object.prototype.hasOwnProperty.call(b, 'id')) {
    errors.push({
      field: 'id',
      code: 'FORBIDDEN_FIELD',
      message: 'id não deve ser enviado no cadastro; ele é gerado pelo servidor.',
    });
  }

  if (b.titulo === undefined || b.titulo === null) {
    errors.push({ field: 'titulo', code: 'REQUIRED', message: 'titulo é obrigatório.' });
  } else if (typeof b.titulo !== 'string') {
    errors.push({ field: 'titulo', code: 'INVALID_TYPE', message: 'titulo deve ser texto.' });
  } else if (b.titulo.trim() === '') {
    errors.push({ field: 'titulo', code: 'REQUIRED', message: 'titulo é obrigatório.' });
  }

  if (b.plataforma === undefined || b.plataforma === null) {
    errors.push({
      field: 'plataforma',
      code: 'REQUIRED',
      message: 'plataforma é obrigatória.',
    });
  } else if (typeof b.plataforma !== 'string') {
    errors.push({
      field: 'plataforma',
      code: 'INVALID_TYPE',
      message: 'plataforma deve ser texto.',
    });
  } else if (b.plataforma.trim() === '') {
    errors.push({
      field: 'plataforma',
      code: 'REQUIRED',
      message: 'plataforma é obrigatória.',
    });
  }

  if (b.tipoMidia === undefined || b.tipoMidia === null) {
    errors.push({
      field: 'tipoMidia',
      code: 'REQUIRED',
      message: 'tipoMidia é obrigatório.',
    });
  } else if (typeof b.tipoMidia !== 'string' || !TIPO_MIDIA.has(b.tipoMidia)) {
    errors.push({
      field: 'tipoMidia',
      code: 'INVALID_ENUM',
      message: 'tipoMidia deve ser fisica ou digital.',
    });
  }

  if (b.status === undefined || b.status === null) {
    errors.push({ field: 'status', code: 'REQUIRED', message: 'status é obrigatório.' });
  } else if (typeof b.status !== 'string') {
    errors.push({ field: 'status', code: 'INVALID_TYPE', message: 'status deve ser texto.' });
  } else if (b.status.trim() === '') {
    errors.push({ field: 'status', code: 'REQUIRED', message: 'status é obrigatório.' });
  } else if (!STATUS.has(b.status)) {
    errors.push({
      field: 'status',
      code: 'INVALID_ENUM',
      message: 'status deve ser um dos valores: nao_iniciado, jogando, zerado.',
    });
  }

  if (b.precoPago === undefined || b.precoPago === null) {
    errors.push({
      field: 'precoPago',
      code: 'REQUIRED',
      message: 'precoPago é obrigatório.',
    });
  } else if (typeof b.precoPago !== 'number' || Number.isNaN(b.precoPago)) {
    errors.push({
      field: 'precoPago',
      code: 'INVALID_TYPE',
      message: 'precoPago deve ser número.',
    });
  } else if (b.precoPago < 0) {
    errors.push({
      field: 'precoPago',
      code: 'MIN_VALUE',
      message: 'precoPago deve ser maior ou igual a 0.',
    });
  }

  if (b.notaPessoal !== undefined && b.notaPessoal !== null) {
    if (typeof b.notaPessoal !== 'number' || Number.isNaN(b.notaPessoal)) {
      errors.push({
        field: 'notaPessoal',
        code: 'INVALID_TYPE',
        message: 'notaPessoal deve ser número ou null.',
      });
    } else if (b.notaPessoal < 0 || b.notaPessoal > 10) {
      errors.push({
        field: 'notaPessoal',
        code: 'OUT_OF_RANGE',
        message: 'notaPessoal deve estar entre 0 e 10.',
      });
    }
  }

  if (b.horasJogadas !== undefined) {
    if (typeof b.horasJogadas !== 'number' || Number.isNaN(b.horasJogadas)) {
      errors.push({
        field: 'horasJogadas',
        code: 'INVALID_TYPE',
        message: 'horasJogadas deve ser número.',
      });
    } else if (b.horasJogadas < 0) {
      errors.push({
        field: 'horasJogadas',
        code: 'MIN_VALUE',
        message: 'horasJogadas deve ser maior ou igual a 0.',
      });
    }
  }

  if (b.dataCompra !== undefined && b.dataCompra !== null && b.dataCompra !== '') {
    if (typeof b.dataCompra !== 'string' || !ISO_DATE.test(b.dataCompra)) {
      errors.push({
        field: 'dataCompra',
        code: 'INVALID_DATE',
        message: 'dataCompra deve estar no formato ISO (ex.: 2026-04-14).',
      });
    } else {
      const t = Date.parse(`${b.dataCompra}T00:00:00.000Z`);
      if (Number.isNaN(t)) {
        errors.push({
          field: 'dataCompra',
          code: 'INVALID_DATE',
          message: 'dataCompra deve estar no formato ISO (ex.: 2026-04-14).',
        });
      }
    }
  }

  if (b.moeda !== undefined && b.moeda !== null) {
    if (typeof b.moeda !== 'string') {
      errors.push({ field: 'moeda', code: 'INVALID_TYPE', message: 'moeda deve ser texto.' });
    }
  }

  if (b.detalhesMidia === undefined || b.detalhesMidia === null) {
    errors.push({
      field: 'detalhesMidia',
      code: 'REQUIRED',
      message: 'detalhesMidia é obrigatório.',
    });
  } else if (typeof b.detalhesMidia !== 'object' || Array.isArray(b.detalhesMidia)) {
    errors.push({
      field: 'detalhesMidia',
      code: 'INVALID_TYPE',
      message: 'detalhesMidia deve ser um objeto.',
    });
  } else if (typeof b.tipoMidia === 'string' && TIPO_MIDIA.has(b.tipoMidia)) {
    const d = /** @type {Record<string, unknown>} */ (b.detalhesMidia);
    const keys = Object.keys(d);

    if (b.tipoMidia === 'digital') {
      for (const k of keys) {
        if (!DIGITAL_KEYS.has(k)) {
          errors.push({
            field: `detalhesMidia.${k}`,
            code: 'FORBIDDEN_FIELD',
            message: 'Campo não permitido para tipoMidia=digital.',
          });
        }
      }
      validateDigital(d, errors);
    } else {
      for (const k of keys) {
        if (!FISICA_KEYS.has(k)) {
          errors.push({
            field: `detalhesMidia.${k}`,
            code: 'FORBIDDEN_FIELD',
            message: 'Campo não permitido para tipoMidia=fisica.',
          });
        }
      }
      validateFisica(d, errors);
    }
  }

  return errors;
}

/**
 * @param {Record<string, unknown>} d
 * @param {ValidationError[]} errors
 */
function validateDigital(d, errors) {
  const missing = ['lojaDigital', 'licencaTipo', 'statusLicenca'].filter(
    (k) => d[k] === undefined || d[k] === null,
  );
  if (missing.length > 0) {
    errors.push({
      field: 'detalhesMidia',
      code: 'INCOMPLETE_OBJECT',
      message:
        'Para mídia digital, informe lojaDigital, licencaTipo e statusLicenca.',
    });
  }

  if (d.lojaDigital === undefined || d.lojaDigital === null) {
    /* coberto por INCOMPLETE_OBJECT */
  } else if (typeof d.lojaDigital !== 'string') {
    errors.push({
      field: 'detalhesMidia.lojaDigital',
      code: 'INVALID_TYPE',
      message: 'lojaDigital deve ser texto.',
    });
  } else if (d.lojaDigital.trim() === '') {
    errors.push({
      field: 'detalhesMidia.lojaDigital',
      code: 'REQUIRED',
      message: 'lojaDigital é obrigatória.',
    });
  }

  if (d.licencaTipo === undefined || d.licencaTipo === null) {
    /* incomplete */
  } else if (typeof d.licencaTipo !== 'string' || !LICENCA_TIPO.has(d.licencaTipo)) {
    errors.push({
      field: 'detalhesMidia.licencaTipo',
      code: 'INVALID_ENUM',
      message: 'licencaTipo deve ser compra, assinatura ou resgate_codigo.',
    });
  }

  if (d.statusLicenca === undefined || d.statusLicenca === null) {
    /* incomplete */
  } else if (typeof d.statusLicenca !== 'string' || !STATUS_LICENCA.has(d.statusLicenca)) {
    errors.push({
      field: 'detalhesMidia.statusLicenca',
      code: 'INVALID_ENUM',
      message: 'statusLicenca deve ser ativa, expirada ou removida.',
    });
  }
}

/**
 * @param {Record<string, unknown>} d
 * @param {ValidationError[]} errors
 */
function validateFisica(d, errors) {
  const missing = ['formatoFisico', 'estadoMidia', 'regiao'].filter(
    (k) => d[k] === undefined || d[k] === null,
  );
  if (missing.length > 0) {
    errors.push({
      field: 'detalhesMidia',
      code: 'INCOMPLETE_OBJECT',
      message:
        'Para mídia física, informe formatoFisico, estadoMidia e regiao.',
    });
  }

  if (d.formatoFisico === undefined || d.formatoFisico === null) {
    /* incomplete */
  } else if (typeof d.formatoFisico !== 'string' || !FORMATO_FISICO.has(d.formatoFisico)) {
    errors.push({
      field: 'detalhesMidia.formatoFisico',
      code: 'INVALID_ENUM',
      message: 'formatoFisico deve ser disco, cartucho ou colecionador.',
    });
  }

  if (d.estadoMidia === undefined || d.estadoMidia === null) {
    /* incomplete */
  } else if (typeof d.estadoMidia !== 'string' || !ESTADO_MIDIA.has(d.estadoMidia)) {
    errors.push({
      field: 'detalhesMidia.estadoMidia',
      code: 'INVALID_ENUM',
      message: 'estadoMidia deve ser novo, semi_novo ou usado.',
    });
  }

  if (d.regiao === undefined || d.regiao === null) {
    /* incomplete */
  } else if (typeof d.regiao !== 'string') {
    errors.push({
      field: 'detalhesMidia.regiao',
      code: 'INVALID_TYPE',
      message: 'regiao deve ser texto.',
    });
  } else if (d.regiao.trim() === '') {
    errors.push({
      field: 'detalhesMidia.regiao',
      code: 'REQUIRED',
      message: 'regiao é obrigatória.',
    });
  }
}
