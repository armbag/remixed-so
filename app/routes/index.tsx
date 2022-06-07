import type { Repo } from '../models/Repo'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import localRepos from '../local-repos/repos.json'
import { useState } from 'react'

const fetchRemoteRepos = async (): Promise<any> => {
	const response = await fetch(
		' https://api.github.com/users/silverorange/repos'
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
	let uniqueLangs = [...new Set(allRepos.map((repo: Repo) => repo.language))]
	const allReposReverseChronologicalOrder = allRepos.sort(
		(repoA: Repo, repoB: Repo) => {
			return repoB.created_at.localeCompare(repoA.created_at)
		}
	)
	// let newlangs = uniqueLang as string[]
	uniqueLangs.push('')

	return json({
		repos: allReposReverseChronologicalOrder,
		languages: uniqueLangs as string[],
	})
}

export default function Index() {
	const { repos, languages } = useLoaderData()
	const [selectedLang, setSelectedLang] = useState('')
	const [selectedRepoName, setSelectedRepoName] = useState('')

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

	return (
		<div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
			<h1>SO Remixed</h1>
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
			{repos.map((repo: Repo) => (
				<div key={repo.id}>{repo.full_name}</div>
			))}
		</div>
	)
}
