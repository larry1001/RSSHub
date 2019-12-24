const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const tag = ctx.params.tag || '';
    const host = 'http://www.chanpin100.com/';

    const link = `${host}${tag}`;
    const response = await got.get(link);

    const $ = cheerio.load(response.data);
    const list = $('div.article-list > div.article-container div.item').get();

    const channel = $('title').text();

    // 加载文章页
    async function load(link) {
        const response = await got.get(link);
        const $ = cheerio.load(response.data);

        let time = $('section.article-heading ul li.date').text();
        time = time.replace('发布于', '');
        const pubDate = date(time, 8);
        const content = $('div.main-article').html();
        const description = content;
        return { description, pubDate };
    }

        const items = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('h4.media-heading > a').text();
            const link = host + $('h4.media-heading > a').attr("href");
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
        title: `产品壹佰-${channel}`,
        link,
        item: items
    };
};
