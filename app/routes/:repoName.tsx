import type { LinksFunction, LoaderFunction } from '@remix-run/node'
// import { db } from '~/utils/db.server'
import { Link, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { Repo } from '~/models/Repo'
// import type { Repo } from '@prisma/client'
import repoPage from '../styles/repoPage.css'

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: repoPage,
		},
	]
}
// type LoaderData = { repo: Repo }

export const loader: LoaderFunction = async ({ params }) => {
	console.log('params', params)
	const repo = params.repoName?.replace('-', '/')
	if (!repo) throw new Error('Repo not found')
	const readMe = await fetch(
		`https://raw.githubusercontent.com/${repo}/master/README.md`
	).then((res) => res.text())
	return json({ name: repo, readMe, commitInfo: null })
}

export default function JokeRoute() {
	const data = useLoaderData()

	return (
		<div>
			<Link to="/">Back to Repos</Link>
			<h2>Information about {data.name}</h2>
			<p>readme : {data.readMe}</p>
		</div>
	)
}
