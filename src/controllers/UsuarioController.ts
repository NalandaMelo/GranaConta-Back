import { Request, Response } from 'express';
import {
  createUsuario,
  findUsuarioByEmail,
  findUsuarioById,
  updateToken,
  listUsuarios,
} from '../models/Usuario';
import { generateToken } from '../services/TokenService';

/**
 * Formata valor numérico de renda para o padrão brasileiro (vírgula como separador decimal).
 * Ex: 3000.50 → "3000,50"
 */
function formatRenda(valor: number): string {
  return valor.toFixed(2).replace('.', ',');
}

/** Controlador de rotas de usuário (cadastro, login, info, listar). */
export const UsuarioController = {
  /**
   * POST /usuarios
   * Cria uma nova conta de usuário.
   * Valida campos obrigatórios, verifica email duplicado e retorna token de autenticação.
   */
  cadastro(req: Request, res: Response): void {
    try {
      const { nome, email, senha, rendaMensal } = req.body;

      if (!nome || !email || !senha || rendaMensal === undefined) {
        res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha, rendaMensal' });
        return;
      }

      const existente = findUsuarioByEmail(email);
      if (existente) {
        res.status(409).json({ erro: 'Email já cadastrado' });
        return;
      }

      const renda = typeof rendaMensal === 'string'
        ? parseFloat((rendaMensal as string).replace(',', '.'))
        : rendaMensal;

      const token = generateToken();
      createUsuario(nome, email, senha, renda, token);

      res.status(201).json({ token });
    } catch (err) {
      console.log(err)
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },

  /**
   * POST /usuarios/login
   * Autentica um usuário por email e senha.
   * Em caso de sucesso, um novo token UUID é gerado e armazenado.
   */
  login(req: Request, res: Response): void {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        res.status(400).json({ erro: 'Campos obrigatórios: email, senha' });
        return;
      }

      const usuario = findUsuarioByEmail(email);
      if (!usuario) {
        res.status(401).json({ erro: 'Email ou senha inválidos' });
        return;
      }

      if (usuario.senha !== senha) {
        res.status(401).json({ erro: 'Email ou senha inválidos' });
        return;
      }

      const token = generateToken();
      updateToken(usuario.id, token);

      res.status(200).json({ token });
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },

  /**
   * GET /usuario
   * Retorna informações do usuário autenticado (nome, email, rendaMensal).
   * Requer token Bearer válido (middleware auth).
   */
  info(req: Request, res: Response): void {
    try {
      const usuario = findUsuarioById(req.usuarioId!);
      if (!usuario) {
        res.status(404).json({ erro: 'Usuário não encontrado' });
        return;
      }

      res.status(200).json({
        nome: usuario.nome,
        email: usuario.email,
        rendaMensal: formatRenda(usuario.rendaMensal),
      });
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },

  /**
   * GET /usuarios
   * Lista todos os usuários cadastrados (apenas id, nome e email).
   * Requer token Bearer válido.
   */
  listar(req: Request, res: Response): void {
    try {
      const usuarios = listUsuarios();
      res.status(200).json({ usuarios });
    } catch (err) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  },
};
