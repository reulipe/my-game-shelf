import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect } from 'chai';
import request from 'supertest';

import { createApp } from '../../src/app.js';
import { resetJogosStore } from '../../src/store/jogosStore.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @param {string} fileName */
function loadFixture(fileName) {
  const raw = readFileSync(join(__dirname, 'fixtures', fileName), 'utf8');
  return JSON.parse(raw);
}

describe('POST /jogos', () => {
  let app;

  before(() => {
    app = createApp();
  });

  beforeEach(() => {
    resetJogosStore();
  });

  describe('sucesso (201)', () => {
    it('cadastra jogo digital com fixture completa e retorna id numérico', async () => {
      const payload = loadFixture('valid-digital-full.json');
      const res = await request(app).post('/jogos').send(payload);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.include({
        id: 1,
        titulo: payload.titulo,
        plataforma: payload.plataforma,
        tipoMidia: 'digital',
        status: payload.status,
        precoPago: payload.precoPago,
      });
      expect(res.body.data.detalhesMidia).to.deep.equal(payload.detalhesMidia);
    });

    it('cadastra jogo físico com fixture completa', async () => {
      const payload = loadFixture('valid-fisica-full.json');
      const res = await request(app).post('/jogos').send(payload);

      expect(res.status).to.equal(201);
      expect(res.body.data.id).to.equal(1);
      expect(res.body.data.tipoMidia).to.equal('fisica');
      expect(res.body.data.detalhesMidia).to.deep.equal(payload.detalhesMidia);
    });

    it('aceita precoPago = 0 e campos opcionais omitidos (fixture mínima digital)', async () => {
      const payload = loadFixture('valid-digital-minimal.json');
      const res = await request(app).post('/jogos').send(payload);

      expect(res.status).to.equal(201);
      expect(res.body.data.precoPago).to.equal(0);
      expect(res.body.data).to.not.have.property('notaPessoal');
      expect(res.body.data).to.not.have.property('moeda');
    });

    it('aceita notaPessoal null', async () => {
      const payload = loadFixture('valid-digital-nota-null.json');
      const res = await request(app).post('/jogos').send(payload);

      expect(res.status).to.equal(201);
      expect(res.body.data).to.have.property('notaPessoal', null);
    });

    it('incrementa id a cada novo cadastro', async () => {
      const a = loadFixture('valid-digital-minimal.json');
      const b = structuredClone(a);
      b.titulo = 'Outro jogo';

      const r1 = await request(app).post('/jogos').send(a);
      const r2 = await request(app).post('/jogos').send(b);

      expect(r1.body.data.id).to.equal(1);
      expect(r2.body.data.id).to.equal(2);
    });
  });

  describe('validação (422) — regras gerais', () => {
    it('rejeita envio de id (FORBIDDEN_FIELD)', async () => {
      const payload = loadFixture('valid-digital-minimal.json');
      const res = await request(app).post('/jogos').send({ ...payload, id: 99 });

      expect(res.status).to.equal(422);
      expect(res.body.errors.some((e) => e.field === 'id' && e.code === 'FORBIDDEN_FIELD')).to.be
        .true;
    });

    it('rejeita titulo ausente, vazio e tipo inválido', async () => {
      const base = loadFixture('valid-digital-minimal.json');

      const r1 = await request(app).post('/jogos').send({ ...base, titulo: undefined });
      expect(r1.status).to.equal(422);
      expect(r1.body.errors.some((e) => e.field === 'titulo' && e.code === 'REQUIRED')).to.be.true;

      const r2 = await request(app).post('/jogos').send({ ...base, titulo: '   ' });
      expect(r2.status).to.equal(422);
      expect(r2.body.errors.some((e) => e.field === 'titulo' && e.code === 'REQUIRED')).to.be.true;

      const r3 = await request(app).post('/jogos').send({ ...base, titulo: 123 });
      expect(r3.status).to.equal(422);
      expect(r3.body.errors.some((e) => e.field === 'titulo' && e.code === 'INVALID_TYPE')).to.be
        .true;
    });

    it('rejeita plataforma ausente, vazia e tipo inválido', async () => {
      const base = loadFixture('valid-digital-minimal.json');

      const r1 = await request(app).post('/jogos').send({ ...base, plataforma: undefined });
      expect(r1.body.errors.some((e) => e.field === 'plataforma' && e.code === 'REQUIRED')).to.be
        .true;

      const r2 = await request(app).post('/jogos').send({ ...base, plataforma: '' });
      expect(r2.body.errors.some((e) => e.field === 'plataforma' && e.code === 'REQUIRED')).to.be
        .true;

      const r3 = await request(app).post('/jogos').send({ ...base, plataforma: [] });
      expect(r3.body.errors.some((e) => e.field === 'plataforma' && e.code === 'INVALID_TYPE')).to
        .be.true;
    });

    it('rejeita tipoMidia ausente ou inválido', async () => {
      const base = loadFixture('valid-digital-minimal.json');

      const r1 = await request(app).post('/jogos').send({ ...base, tipoMidia: undefined });
      expect(r1.body.errors.some((e) => e.field === 'tipoMidia' && e.code === 'REQUIRED')).to.be
        .true;

      const r2 = await request(app).post('/jogos').send({ ...base, tipoMidia: 'nuvem' });
      expect(r2.body.errors.some((e) => e.field === 'tipoMidia' && e.code === 'INVALID_ENUM')).to.be
        .true;
    });

    it('rejeita status ausente, vazio ou fora do enum', async () => {
      const base = loadFixture('valid-digital-minimal.json');

      const r1 = await request(app).post('/jogos').send({ ...base, status: undefined });
      expect(r1.body.errors.some((e) => e.field === 'status' && e.code === 'REQUIRED')).to.be.true;

      const r2 = await request(app).post('/jogos').send({ ...base, status: '   ' });
      expect(r2.body.errors.some((e) => e.field === 'status' && e.code === 'REQUIRED')).to.be.true;

      const r3 = await request(app).post('/jogos').send({ ...base, status: 'pausado' });
      expect(r3.body.errors.some((e) => e.field === 'status' && e.code === 'INVALID_ENUM')).to.be
        .true;
    });

    it('rejeita precoPago ausente, não numérico ou negativo', async () => {
      const base = loadFixture('valid-digital-minimal.json');

      const r1 = await request(app).post('/jogos').send({ ...base, precoPago: undefined });
      expect(r1.body.errors.some((e) => e.field === 'precoPago' && e.code === 'REQUIRED')).to.be
        .true;

      const r2 = await request(app).post('/jogos').send({ ...base, precoPago: '10' });
      expect(r2.body.errors.some((e) => e.field === 'precoPago' && e.code === 'INVALID_TYPE')).to.be
        .true;

      const r3 = await request(app).post('/jogos').send({ ...base, precoPago: -0.01 });
      expect(r3.body.errors.some((e) => e.field === 'precoPago' && e.code === 'MIN_VALUE')).to.be
        .true;
    });

    it('rejeita notaPessoal inválida ou fora da faixa 0–10', async () => {
      const base = loadFixture('valid-digital-minimal.json');

      const r1 = await request(app).post('/jogos').send({ ...base, notaPessoal: '8' });
      expect(r1.body.errors.some((e) => e.field === 'notaPessoal' && e.code === 'INVALID_TYPE')).to
        .be.true;

      const r2 = await request(app).post('/jogos').send({ ...base, notaPessoal: 10.1 });
      expect(r2.body.errors.some((e) => e.field === 'notaPessoal' && e.code === 'OUT_OF_RANGE')).to
        .be.true;

      const r3 = await request(app).post('/jogos').send({ ...base, notaPessoal: -0.1 });
      expect(r3.body.errors.some((e) => e.field === 'notaPessoal' && e.code === 'OUT_OF_RANGE')).to
        .be.true;
    });

    it('rejeita horasJogadas não numérica ou negativa', async () => {
      const base = loadFixture('valid-digital-minimal.json');

      const r1 = await request(app).post('/jogos').send({ ...base, horasJogadas: '1' });
      expect(r1.body.errors.some((e) => e.field === 'horasJogadas' && e.code === 'INVALID_TYPE')).to
        .be.true;

      const r2 = await request(app).post('/jogos').send({ ...base, horasJogadas: -1 });
      expect(r2.body.errors.some((e) => e.field === 'horasJogadas' && e.code === 'MIN_VALUE')).to.be
        .true;
    });

    it('rejeita dataCompra com formato inválido', async () => {
      const base = loadFixture('valid-digital-minimal.json');
      const res = await request(app).post('/jogos').send({ ...base, dataCompra: '14-04-2026' });

      expect(res.status).to.equal(422);
      expect(res.body.errors.some((e) => e.field === 'dataCompra' && e.code === 'INVALID_DATE')).to
        .be.true;
    });

    it('rejeita moeda com tipo inválido', async () => {
      const base = loadFixture('valid-digital-minimal.json');
      const res = await request(app).post('/jogos').send({ ...base, moeda: 1 });

      expect(res.status).to.equal(422);
      expect(res.body.errors.some((e) => e.field === 'moeda' && e.code === 'INVALID_TYPE')).to.be
        .true;
    });

    it('rejeita corpo que não é objeto JSON', async () => {
      const res = await request(app).post('/jogos').send([1, 2, 3]);

      expect(res.status).to.equal(422);
      expect(res.body.errors.some((e) => e.field === 'body' && e.code === 'INVALID_TYPE')).to.be
        .true;
    });

    it('rejeita detalhesMidia ausente ou não objeto', async () => {
      const base = loadFixture('valid-digital-minimal.json');

      const r1 = await request(app).post('/jogos').send({ ...base, detalhesMidia: undefined });
      expect(r1.body.errors.some((e) => e.field === 'detalhesMidia' && e.code === 'REQUIRED')).to.be
        .true;

      const r2 = await request(app).post('/jogos').send({ ...base, detalhesMidia: [] });
      expect(r2.body.errors.some((e) => e.field === 'detalhesMidia' && e.code === 'INVALID_TYPE'))
        .to.be.true;
    });
  });

  describe('validação (422) — detalhesMidia digital', () => {
    it('rejeita campos de mídia física quando tipoMidia é digital', async () => {
      const payload = loadFixture('valid-digital-minimal.json');
      payload.detalhesMidia = {
        lojaDigital: 'Steam',
        licencaTipo: 'compra',
        statusLicenca: 'ativa',
        formatoFisico: 'disco',
      };

      const res = await request(app).post('/jogos').send(payload);
      expect(res.status).to.equal(422);
      expect(
        res.body.errors.some(
          (e) => e.field === 'detalhesMidia.formatoFisico' && e.code === 'FORBIDDEN_FIELD',
        ),
      ).to.be.true;
    });

    it('rejeita objeto incompleto e enums inválidos', async () => {
      const base = loadFixture('valid-digital-minimal.json');

      const r1 = await request(app).post('/jogos').send({
        ...base,
        detalhesMidia: { lojaDigital: 'Steam' },
      });
      expect(r1.body.errors.some((e) => e.field === 'detalhesMidia' && e.code === 'INCOMPLETE_OBJECT'))
        .to.be.true;

      const r2 = await request(app).post('/jogos').send({
        ...base,
        detalhesMidia: {
          lojaDigital: 'Steam',
          licencaTipo: 'emprestado',
          statusLicenca: 'ativa',
        },
      });
      expect(
        r2.body.errors.some(
          (e) => e.field === 'detalhesMidia.licencaTipo' && e.code === 'INVALID_ENUM',
        ),
      ).to.be.true;

      const r3 = await request(app).post('/jogos').send({
        ...base,
        detalhesMidia: {
          lojaDigital: 'Steam',
          licencaTipo: 'compra',
          statusLicenca: 'pendente',
        },
      });
      expect(
        r3.body.errors.some(
          (e) => e.field === 'detalhesMidia.statusLicenca' && e.code === 'INVALID_ENUM',
        ),
      ).to.be.true;
    });

    it('rejeita lojaDigital vazia', async () => {
      const base = loadFixture('valid-digital-minimal.json');
      const res = await request(app).post('/jogos').send({
        ...base,
        detalhesMidia: {
          lojaDigital: '  ',
          licencaTipo: 'compra',
          statusLicenca: 'ativa',
        },
      });

      expect(res.status).to.equal(422);
      expect(
        res.body.errors.some(
          (e) => e.field === 'detalhesMidia.lojaDigital' && e.code === 'REQUIRED',
        ),
      ).to.be.true;
    });
  });

  describe('validação (422) — detalhesMidia física', () => {
    it('rejeita campos digitais quando tipoMidia é fisica', async () => {
      const payload = loadFixture('valid-fisica-full.json');
      payload.detalhesMidia = {
        formatoFisico: 'disco',
        estadoMidia: 'novo',
        regiao: 'ALL',
        lojaDigital: 'PSN',
      };

      const res = await request(app).post('/jogos').send(payload);
      expect(res.status).to.equal(422);
      expect(
        res.body.errors.some(
          (e) => e.field === 'detalhesMidia.lojaDigital' && e.code === 'FORBIDDEN_FIELD',
        ),
      ).to.be.true;
    });

    it('rejeita objeto incompleto e enums inválidos', async () => {
      const base = loadFixture('valid-fisica-full.json');

      const r1 = await request(app).post('/jogos').send({
        ...base,
        detalhesMidia: { formatoFisico: 'disco' },
      });
      expect(r1.body.errors.some((e) => e.field === 'detalhesMidia' && e.code === 'INCOMPLETE_OBJECT'))
        .to.be.true;

      const r2 = await request(app).post('/jogos').send({
        ...base,
        detalhesMidia: {
          formatoFisico: 'pendrive',
          estadoMidia: 'novo',
          regiao: 'ALL',
        },
      });
      expect(
        r2.body.errors.some(
          (e) => e.field === 'detalhesMidia.formatoFisico' && e.code === 'INVALID_ENUM',
        ),
      ).to.be.true;

      const r3 = await request(app).post('/jogos').send({
        ...base,
        detalhesMidia: {
          formatoFisico: 'disco',
          estadoMidia: 'quebrado',
          regiao: 'ALL',
        },
      });
      expect(
        r3.body.errors.some(
          (e) => e.field === 'detalhesMidia.estadoMidia' && e.code === 'INVALID_ENUM',
        ),
      ).to.be.true;
    });

    it('rejeita regiao vazia', async () => {
      const base = loadFixture('valid-fisica-full.json');
      const res = await request(app).post('/jogos').send({
        ...base,
        detalhesMidia: {
          formatoFisico: 'disco',
          estadoMidia: 'novo',
          regiao: '   ',
        },
      });

      expect(res.status).to.equal(422);
      expect(
        res.body.errors.some((e) => e.field === 'detalhesMidia.regiao' && e.code === 'REQUIRED'),
      ).to.be.true;
    });
  });
});
