import type { ActionFunction, LinksFunction } from '@remix-run/node'
// import { db } from '~/utils/db.server'
import { Link, useActionData, useNavigate } from '@remix-run/react'
import { json } from '@remix-run/node'
import ReactMarkdown from 'react-markdown'

// import { Repo } from '~/models/Repo'
// import type { Repo } from '@prisma/client'
import repoPage from '../styles/repoPage.css'
import { useEffect } from 'react'

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: repoPage,
		},
	]
}

export function formatDate(date: string): string {
	if (!date) {
		return ''
	}
	const dateObj = new Date(date)

	return new Intl.DateTimeFormat('en-CA', {
		dateStyle: 'medium',
		timeStyle: 'short',
		hour12: false,
	}).format(dateObj)
}

export const action: ActionFunction = async ({ request }) => {
	const form = await request.formData()
	const commitUrl = form.get('commit_url') as string
	const commitRes =
		commitUrl && (await fetch(commitUrl).then((res) => res && res.json()))

	const fullName = form.get('full_name') as string
	const repoName = fullName.replace('orange-', 'orange/')
	const readMe = await fetch(
		`https://raw.githubusercontent.com/${repoName}/master/README.md`
	).then((res) => {
		if (res.status === 404) {
			return 'No README.md found for this repository'
		}
		return res.text()
	})

	const commitData = {
		name: commitRes?.commit?.commit.author.name,
		date: commitRes?.commit?.commit.author.date,
		message: commitRes?.commit?.commit.message,
	}
	return json({ name: repoName, commitData, readMe })
}

export default function RepoRoute() {
	const data = useActionData()
	const navigate = useNavigate()

	useEffect(() => {
		if (!data) {
			navigate('/')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data])

	if (!data) {
		return null
	}
	return (
		<div>
			<Link to="/" state={'remove-filter'}>
				Back to Repos
			</Link>
			<>
				<h3 className="commit-title">Last Commit Information</h3>
				{data.commitData.name ? (
					<div className="commit-info">
						<div className="commit-labels">
							<div>Author:</div>
							<div>Date:</div>
							<div>Message:</div>
						</div>
						<div>
							<div className="commit-author">{data.commitData.name}</div>
							<div className="commit-date">
								{formatDate(data.commitData.date)}
							</div>
							<div className="commit-message"> {data.commitData.message}</div>
						</div>
					</div>
				) : (
					<p>Unable to retrieve last commit information</p>
				)}
			</>
			<h2>
				{data.name} <code>README.md</code>
			</h2>
			<ReactMarkdown children={data.readMe} />
		</div>
	)
}
