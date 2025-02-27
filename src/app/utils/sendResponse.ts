import { Response } from "express"


type TResponse <T, W> = {
    statusCode: number,
    success: boolean,
    message?: string,
    data?: T
    meta?: W
}

const sendResponse = <T,W>(res: Response, data: TResponse<T, W>) => {
    res.status(data.statusCode).json({
        success: data.success,
        statusCode: data.statusCode,
        message: data.message,
        data: data.data,
        meta: data.meta
    })
}

export default sendResponse