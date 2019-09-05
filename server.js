const request = require('request-promise');
const cheerio = require('cheerio');
const Crawler = require('crawler');
const {Parser} = require('json2csv');
const fs = require('fs')

const URLPAI = 'https://www.imoveis-sc.com.br/blumenau/comprar/apartamento'

/*Função responsável por criar todos os links pai */
async function extraiUrlPai() {
    const requisicao = await request(URLPAI);
    let $ = cheerio.load(requisicao);
    let vlrMaximo = $('#main > div > div > div > div.navigation > div').text()
    let vlrMaximoArray = vlrMaximo.split('\n')
    let nrpgs = vlrMaximoArray.length
    let totpgsPai = (nrpgs / 2) - 2
    let count = 0

    while (count <= totpgsPai) {
        const urlsFilhos = 'https://www.imoveis-sc.com.br/blumenau/comprar/apartamento?page=' + count
        
        extLinksPais.queue([urlsFilhos])
        count++
    }


};


/*Função responsável por extrair informações individuais de imóveis */
let imoveisDados = []
const crawpgFilha = new Crawler({
    rateLimit: 5000,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            let $ = res.$;
            let nome = $('#main > div.wrapper.wrapper-extra.wraspper-big > header.visualizar-header > h1').text().trim()
            let preco = $('#main > div.wrapper.wrapper-extra.wraspper-big > section > div > div > div.visualizar-info > div > header > div > strong').text().trim()
            let quartos = $('#main > div.wrapper.wrapper-extra.wraspper-big > section > div > div > div.visualizar-info > div > div > ol > li:nth-child(1) > strong').text()
            let metrosQuadrados = $('#main > div.wrapper.wrapper-extra.wraspper-big > section > div > div > div.visualizar-info > div > div > ol > li:nth-child(3) > strong').text()
            console.log(`${nome} - ${preco} -${quartos} - ${metrosQuadrados}`)

            imoveisDados.push({
                nome,
                preco,
                quartos,
                metrosQuadrados
            })
        }
        done();
        const json2csvParser = new Parser()
        const csv = json2csvParser.parse(imoveisDados)
        console.log(csv)
        fs.writeFileSync('./dados-imoveis.csv', csv, 'utf-8')
    }

});



/*Função responsável por extrair links de filhos de pagina pai */
const extLinksPais = new Crawler({
    rateLimit: 5000,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            const $ = res.$;
            $("a[class='btn btn-md btn-upper btn-green btn-visualizar']").each(function (i, link) {
                let links = $(link).attr('href')
                let linksArr = links.split('\n')
                
                crawpgFilha.queue(linksArr)
            })
        }
        done();
    }
});
extraiUrlPai()
