import express, { request } from "express";

import cors from 'cors';

import{PrismaClient} from '@prisma/client'
import { convertHourStringToMinutes } from "./utils/convert-hour-string-to-minutes";
import { convertMinutesToHourString } from "./utils/convert-minutes-to-hour-string";


const app = express()

app.use(express.json())

app.use(cors())

const prisma = new PrismaClient({
    log:['query']
})

//HTTP methods / API restfull // HTTP Codes



//Listagem dos games
app.get('/games', async (request,response)=>{

    const games = await prisma.game.findMany({
        include:{
            _count:{
                select:{
                    ads: true,
                }
            }
        }
    })

    return response.json(games);
});

//Listagem dos anúncios
app.post('/games/:id/ads', async(request,response)=>{

    const gameId = request.params.id;
    const body: any = request.body;


    const ad = await prisma.ad.create({
        data:{
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertHourStringToMinutes(body.hourStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
        }
    })

    return response.status(201).json(ad);
});


//Listagem do ID do game de determinado anúncio
app.get('/games/:id/ads', async (resquest, response) => {

    const gameId = resquest.params.id;

    const ads = await prisma.ad.findMany({
        select:{
            id:true,
            name:true,
            weekDays:true,
            useVoiceChannel:true,
            yearsPlaying:true,
            hourStart:true,
            hourEnd:true,
        },
        where:{
            gameId,
        },
        orderBy:{
            createdAt:'desc'
        }
    })

    return response.json(ads.map(ad => {
        return{
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesToHourString(ad.hourStart),
            hourEnd: convertMinutesToHourString(ad.hourEnd),
        }
    }))
})

//Listagem do Discord pelo ID do anúncio
app.get('/ads/:id/discord', async(resquest, response) => {

    const adId = resquest.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select:{
            discord:true,
        },
        where:{
            id:adId,
        }
    })
    
    return response.json({
        discord: ad.discord,
    })
})

app.listen(3333)