const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { tag, type } = ctx.params;

    const link = `http://${tag}.dxy.cn/tag/${type}`;
    const response = await got.get(link);

    const $ = cheerio.load(response.data);
    const list = $('.x_wrap1.fl > dl.x_box12').get();

    const channel = $('a.channel_name').text();

        // 加载文章页
    async function load(link) {
        const response = await got.get(link);
        const $ = cheerio.load(response.data);

        const time = $('#j_article_desc div.x_box13 div.sum > span').eq(0).text();
        const pubDate = new Date(time).toUTCString();

        const content = $('div#j_article_desc').html();
        const description = content;
        return { description, pubDate };
    }

    const items = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('a.h4').text();
            const link = $('a.h4').attr('href');
            const single = {
                title: title,
                link: link,
                guid: link
            };
            if (link) {
                const other = await ctx.cache.tryGet(link, async () => await load(link));
                return Promise.resolve(Object.assign({}, single, other));
            }

            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `丁香园-${channel}`,
        link,
        item: items
    };
};
