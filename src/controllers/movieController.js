import * as model from '../models/movieModel.js';

export const getAll = async (req, res) => {
    try {
        const movies = await model.findAll(req.query);

        if (!movies || movies.length === 0) {
            return res.status(200).json({
                message: 'Nenhum registro encontrado.',
            });
        }
        res.json(movies);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registros' });
    }
};

export const create = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                error: 'Corpo da requisição vazio. Envie os dados do filme!',
            });
        }

        const { title, description, duration, genre, rating, available } = req.body;

        if (!title) return res.status(400).json({ error: 'O título é obrigatório!' });

        if (title.trim().length < 3)
            return res.status(400).json({ error: 'O título deve ter no mínimo 3 caracteres!' });

        const titleExists = await model.findAll({ title });

        if (titleExists.length > 0) {
            return res.status(409).json({
                error: `Já existe um filme cadastrado com o título "${title}".`,
            });
        }

        if (!description) return res.status(400).json({ error: 'A descrição é obrigatória!' });

        if (description.trim().length < 10)
            return res.status(400).json({ error: 'A descrição deve ter mais de 10 caracteres!' });

            const palavrasProibidas = [
            'palavrão',
            'ofensivo',
            'idiota',
            'burro',
            'imbecil',
            'estúpido',
            'lixo',
            'merda',
            'porcaria',
            'droga',
            'inferno',
            'diabo',
            'ódio',
            'maldito',
            'desgraça',
            'cretino',
            'nojento',
            'ridículo',
            'babaca',
            'otário',
        ];

        if (description) {
            const lowerDescription = description.toLowerCase();

            const palavraEncontrada = palavrasProibidas.find((word) => lowerDescription.includes(word));

            if (palavraEncontrada) {
                return res.status(400).json({
                    success: false,
                    message: `A descrição contém a palavra proibida "${palavraEncontrada}".`,
                });
            }
        }

        if (!duration) return res.status(400).json({ error: 'A duração é obrigatória!' });

        if(duration < 30) return res.status(400).json({error: 'A duração mínima é de 30 minutos!'})

        if (duration <= 0)
            return res
                .status(400)
                .json({ error: 'A duração deve ser um número inteiro e positivo!' });

        if (duration > 300)
            return res.status(400).json({ error: 'A duração deve ser menor que 300 minutos!' });

        if (!genre) return res.status(400).json({ error: 'O genêro é obrigatório!' });

        const available_genres = [
            'Ação',
            'Drama',
            'Comédia',
            'Terror',
            'Romance',
            'Animação',
            'Ficção',
            'Científica',
            'Suspense',
        ];

        if (genre) {
            if (!available_genres.includes(genre)) {
                return res.status(400).json({
                    success: false,
                    message: `O genêro "${genre}" não é válido. Genêros permitidos: ${available_genres.join(', ')}.`,
                });
            }
        }

        if (!rating) return res.status(400).json({ error: 'A avaliação é obrigatória!' });

        if(rating > 8 && genre === "Terror") return res.status(400).json({ error: 'Se o genêro for terror, a nota não pode ser maior que 8'})

        if (rating < 0 || rating > 10)
            return res.status(400).json({ error: 'A avaliação deve ser um número entre 0 e 10!' });

        if (available === undefined)
            return res.status(400).json({ error: 'A disponibilidade é obrigatória!' });

        if (available != true)
            return res
                .status(400)
                .json({ error: 'Ao criar um filme, a disponibilidade deve ser verdadeira!' });

        const data = await model.create({
            title,
            description,
            duration: parseInt(duration),
            genre,
            rating: parseFloat(rating),
            available: available === 'true' || available === true,
        });

        res.status(201).json({
            message: 'Registro cadastrado com sucesso!',
            data,
        });
    } catch (error) {
        console.error('Erro ao criar:', error);
        res.status(500).json({ error: 'Erro interno no servidor ao salvar o registro.' });
    }
};

export const getById = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const data = await model.findById(id);
        if (!data) {
            return res.status(404).json({ error: 'Registro não encontrado.' });
        }
        res.json({ data });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registro' });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                error: 'Corpo da requisição vazio. Envie os dados do filme!',
            });
        }

        const exists = await model.findById(id);
        if (!exists) {
            return res.status(404).json({ error: 'Registro não encontrado para atualizar.' });
        }

        if (exists.available === false) {
            return res.status(403).json({
                error: 'Filmes indisponíveis não podem ser atualizados.',
            });
        }

        const { title, description, duration, genre, rating, available } = req.body;

        if (title !== undefined) {
            if (!title) {
                return res.status(400).json({ error: 'O título é obrigatório!' });
            }

            if (title.trim().length < 3) {
                return res.status(400).json({
                    error: 'O título deve ter no mínimo 3 caracteres!',
                });
            }

            const titleExists = await model.findAll({ title });
            if (titleExists.length > 0 && titleExists[0].id != id) {
                return res.status(409).json({
                    error: `Já existe um filme cadastrado com o título "${title}".`,
                });
            }
        }

        if (description !== undefined) {
            if (!description) {
                return res.status(400).json({ error: 'A descrição é obrigatória!' });
            }

            if (description.trim().length < 10) {
                return res.status(400).json({
                    error: 'A descrição deve ter mais de 10 caracteres!',
                });
            }
        }

        const palavrasProibidas = [
            'palavrão',
            'ofensivo',
            'idiota',
            'burro',
            'imbecil',
            'estúpido',
            'lixo',
            'merda',
            'porcaria',
            'droga',
            'inferno',
            'diabo',
            'ódio',
            'maldito',
            'desgraça',
            'cretino',
            'nojento',
            'ridículo',
            'babaca',
            'otário',
        ];

        if (description) {
            const lowerDescription = description.toLowerCase();

            const palavraEncontrada = palavrasProibidas.find((word) =>
                lowerDescription.includes(word),
            );

            if (palavraEncontrada) {
                return res.status(400).json({
                    success: false,
                    message: `A descrição contém a palavra proibida "${palavraEncontrada}".`,
                });
            }
        }

        if (duration !== undefined) {
            if (!duration) {
                return res.status(400).json({ error: 'A duração é obrigatória!' });
            }

            if (duration <= 0) {
                return res.status(400).json({
                    error: 'A duração deve ser um número inteiro e positivo!',
                });
            }

            if (duration > 300) {
                return res.status(400).json({
                    error: 'A duração deve ser menor que 300 minutos!',
                });
            }
        }

        const available_genres = [
            'Ação',
            'Drama',
            'Comédia',
            'Terror',
            'Romance',
            'Animação',
            'Ficção',
            'Científica',
            'Suspense',
        ];

        if (genre !== undefined) {
            if (!genre) {
                return res.status(400).json({ error: 'O gênero é obrigatório!' });
            }

            if (!available_genres.includes(genre)) {
                return res.status(400).json({
                    message: `O gênero "${genre}" não é válido. Gêneros permitidos: ${available_genres.join(', ')}.`,
                });
            }
        }

        if (rating !== undefined) {
            if (rating < 0 || rating > 10) {
                return res.status(400).json({
                    error: 'A avaliação deve ser um número entre 0 e 10!',
                });
            }
        }

        if (available !== undefined) {
            if (
                available !== true &&
                available !== false &&
                available !== 'true' &&
                available !== 'false'
            ) {
                return res.status(400).json({
                    error: 'A disponibilidade deve ser true ou false!',
                });
            }
        }

        const data = await model.update(id, {
            title,
            description,
            duration: duration !== undefined ? parseInt(duration) : undefined,
            genre,
            rating: rating !== undefined ? parseFloat(rating) : undefined,
            available:
                available !== undefined ? available === true || available === 'true' : undefined,
        });

        res.json({
            message: 'Registro atualizado com sucesso!',
            data,
        });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        res.status(500).json({ error: 'Erro interno no servidor ao atualizar o registro.' });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const exists = await model.findById(id);
        if (!exists) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }

        if (exists.rating >= 9) return res.status(400).json({ error: 'Filmes com nota igual ou superior a 9 não podem ser deletados!' });

        await model.remove(id);
        res.json({
            message: `O registro "${exists.title}" foi deletado com sucesso!`,
            deletado: exists,
        });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar registro' });
    }
};
