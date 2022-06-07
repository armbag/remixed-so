import type { LoaderFunction } from '@remix-run/node'
// import { db } from '~/utils/db.server'
import { Link, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { Repo } from '~/models/Repo'
// import type { Repo } from '@prisma/client'

// type LoaderData = { repo: Repo }

export const loader: LoaderFunction = async ({ params }) => {
	const repo = params.repoId
	if (!repo) throw new Error('Repo not found')
	const data = { repo }
	console.log(data)
	return json(data)
}

export default function JokeRoute() {
	const data = useLoaderData()

	return (
		<div>
			<p>Information about repo...</p>
			<p>repo id : {data.repo}</p>
		</div>
	)
}
