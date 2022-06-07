import { useState } from 'react'
import type { LoaderFunction, LinksFunction } from '@remix-run/node'
import { Outlet, useLoaderData, useNavigate } from '@remix-run/react'
import { json } from '@remix-run/node'
import type { Repo } from '../models/Repo'
import localRepos from '../local-repos/repos.json'

import stylesRepos from '../styles/repos.css'

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: stylesRepos,
		},
	]
}

const fetchRemoteRepos = async (): Promise<any> => {
	const response = await fetch(
		'https://api.github.com/users/silverorange/repos'
	)
	const json = await response.json()
	const correctRepos = json.filter((repo: Repo) => repo.fork === false)

	return correctRepos
}

export const loader: LoaderFunction = async () => {
	const correctLocalRepos = localRepos.filter((repo) => repo.fork === false)
	const remoteRepos = await fetchRemoteRepos()
	const correctRemoteRepos = remoteRepos.filter(
		(repo: Repo) => repo.fork === false
	)
	const allRepos = [...correctLocalRepos, ...correctRemoteRepos]
	const uniqueLangs = [...new Set(allRepos.map((repo: Repo) => repo.language))]
	const allReposReverseChronologicalOrder = allRepos.sort(
		(repoA: Repo, repoB: Repo) => {
			return repoB.created_at.localeCompare(repoA.created_at)
		}
	)

	return json({
		repos: allReposReverseChronologicalOrder,
		languages: [...uniqueLangs, ''] as string[],
	})
}

const columns = ['name', 'description', 'language', 'forks count']

export default function Index() {
	const { repos, languages } = useLoaderData()
	const [selectedLang, setSelectedLang] = useState('')
	const [selectedRepoName, setSelectedRepoName] = useState('')
	let navigate = useNavigate()

	const handleLanguageClick = (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		const value = (event.target as HTMLInputElement).value
		if (value === selectedLang || !value) {
			setSelectedLang('')
		} else {
			setSelectedLang(value)
		}
		setSelectedRepoName('')
	}

	const handleRepoClick = (rep: Repo) => {
		const defaultBranch = rep.default_branch
		const newBranchUrl = rep.branches_url?.replace(
			'{/branch}',
			`/${defaultBranch}`
		)
		// setCommitInfoResource(newBranchUrl ? fetchData(newBranchUrl) : undefined)
		// setReadMeResource(fetchData(githubApi.getReadMe(rep.full_name), 'text'))
		setSelectedRepoName(rep.full_name)
		navigate(`/${rep.id}`)
	}

	return (
		<div
			style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}
			className="repos-container"
		>
			<h1>SO Remixed</h1>
			<div className="buttons-list"></div>

			{languages.map((lang: string, index: number) => (
				<button
					value={lang}
					key={lang + index}
					onClick={handleLanguageClick}
					className={`${lang === '' ? 'all-button' : ''} ${
						selectedLang === lang ? 'active' : ''
					}`}
				>
					{lang === '' ? 'All' : lang}
				</button>
			))}
			<table className="repos-table">
				<thead>
					<tr>
						{columns.map((col) => (
							<th key={col}>{col}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{repos.map((repo: Repo) => {
						if (selectedLang && repo.language !== selectedLang) return null
						return (
							<tr
								key={repo.id}
								onClick={() => handleRepoClick(repo)}
								className={`repo-row ${
									repo.full_name === selectedRepoName ? 'active' : ''
								}`}
							>
								<td>{repo.full_name}</td>
								<td>{repo.description}</td>
								<td>{repo.language}</td>
								<td>{repo.forks_count}</td>
							</tr>
						)
					})}
				</tbody>
			</table>
			<div className="repo-outlet">
				<Outlet />
			</div>
		</div>
	)
}
