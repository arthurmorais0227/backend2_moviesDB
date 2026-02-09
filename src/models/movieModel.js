import prisma from '../utils/prismaClient.js';

export const create = async (data) => {
    return await prisma.movie.create({ data });
};

export const findAll = async (filters = {}) => {
    const {
        title,
        description,
        duration,
        genre,
        rating,
        available,
        minRating,
        maxRating,
        maxDuration,
        minDuration,
    } = filters;
    const where = {};

    if (title) {
        where.title = { contains: title, mode: 'insensitive' };
    }

    if (description) {
        where.description = { contains: description, mode: 'insensitive' };
    }

    if (minRating !== undefined || maxRating !== undefined) {
        where.rating = {};

        if (minRating !== undefined) {
            where.rating.gte = Number(minRating);
        }

        if (maxRating !== undefined) {
            where.rating.lte = Number(maxRating);
        }
    }

    if (duration) {
        where.duration = Number(duration);
    }

    if (minDuration !== undefined || maxDuration !== undefined) {
        where.duration = {};

        if (minDuration !== undefined) {
            where.duration.gte = Number(minDuration);
        }

        if (maxDuration !== undefined) {
            where.duration.lte = Number(maxDuration);
        }
    }

    if (genre) {
        where.genre = { contains: genre, mode: 'insensitive' };
    }

    if (rating) {
        where.rating = Number(rating);
    }

    if (available !== undefined) {
        where.available = available === 'true' || available === true;
    }

    return await prisma.movie.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
};

export const findById = async (id) => {
    return await prisma.movie.findUnique({
        where: { id: Number(id) },
    });
};

export const update = async (id, data) => {
    return await prisma.movie.update({
        where: { id: Number(id) },
        data,
    });
};

export const remove = async (id) => {
    return await prisma.movie.delete({
        where: { id: Number(id) },
    });
};
