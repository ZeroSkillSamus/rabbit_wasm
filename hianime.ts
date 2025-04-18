import axios from 'axios'
import main from './rabbit'
import { getSources } from './cosnumet';

export interface IframeLink {
    is_m3u8: boolean;
    quality: string;
    url: string;
}

export interface IntroOutro {
    start: number;
    end: number;
}

export interface Track {
    file: string,
    label: string,
    kind: string,
    default: boolean
}

export interface Source {
    m3u8_links: IframeLink[],
    tracks: Track[],
    intro: IntroOutro,
    outro: IntroOutro
}
const ORIGIN = "https://megacloud.blog"
const REFERER = "https://megacloud.blog/"

export async function fetch_video_src(episode_id: string) : Promise<Source> {
	const url = new URL(`https://hianime.to/ajax/v2/episode/sources?id=${episode_id}`)
	try {
		let response = await axios.get(url.toString(), {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
				//Cookie:
				//'userSettings={%22auto_play%22:1%2C%22auto_next%22:1%2C%22auto_skip_intro%22:1%2C%22show_comments_at_home%22:1%2C%22public_watch_list%22:0%2C%22enable_dub%22:0%2C%22anime_name%22:%22en%22%2C%22play_original_audio%22:0}',
				'X-Requested-With': 'XMLHttpRequest',
			},
		})
		let link = JSON.parse(JSON.stringify(response.data)).link
		console.log(link)
		//let results = await getSources(link,"https://hianime.to");

        let results = await main(link, "https://hianime.to")
        //console.log(results)
        // Get qualities from sources
        let qualities: IframeLink[] = await fetch_qualities(results.sources[0].file)
		qualities.push({
			is_m3u8: results.sources[0].file.includes(".m3u8"),
			quality: "master",
			url: results.sources[0].file,
		})

		let headers = {
			referer: REFERER,
        	origin: ORIGIN,
		}

        return {
			headers,
            m3u8_links: qualities,
            tracks: results.tracks,
            intro: results.intro,
            outro: results.outro
        }

	} catch (e) {
		console.error(e)
        return {
            m3u8_links: [],
            tracks: [],
            intro: {
                start: 0,
                end: 0
            },
            outro: {
                start: 0,
                end: 0
            },
        }
	}
}

async function fetch_qualities(default_url: string): Promise<IframeLink[]> {
	//const test = 'RESOLUTION=1920x1080,FRAME-RATE=23.974,CODECS'
	let iframeLinks: IframeLink[] = []
	try {
		let response = await axios.get(default_url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
				Referer: 'https://megacloud.club/',
			},
		})
		let resolutions = response.data.match(/(RESOLUTION=)(.*)(\s*?)(\s*.*)/g)
		resolutions?.forEach((str: string) => {
			const index = default_url.lastIndexOf('/')
			const resolution = str.split(',')[0].split('x')[1]
			const top_half = default_url.slice(0, index)
			const full_url = `${top_half}/${str.split('\n')[1]}`
			if (str.split('\n')[1].includes('index'))
				iframeLinks.push({
					is_m3u8: full_url.includes('.m3u8'),
					quality: resolution,
					url: full_url,
				})
		})

		return iframeLinks
	} catch (e) {
		console.error(e)
		return iframeLinks
	}
}

