import { useEffect, useState } from 'react'
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useLocation,
	useNavigate,
	useSubmit,
} from '@remix-run/react'
import { json } from '@remix-run/node'
import type {
	LoaderFunction,
	LinksFunction,
	MetaFunction,
} from '@remix-run/node'
import type { SubmitFunction, SubmitOptions } from '@remix-run/react'
import type { Repo } from './models/Repo'
import localRepos from './local-repos/repos.json'
import stylesRepos from './styles/repos.css'

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: stylesRepos,
		},
	]
}

export const meta: MetaFunction = () => ({
	charset: 'utf-8',
	title: 'SO remixed',
	viewport: 'width=device-width,initial-scale=1',
})

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
	const allRepos = [...correctLocalRepos, ...remoteRepos]
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

function Home() {
	const { repos, languages } = useLoaderData()
	const [selectedLang, setSelectedLang] = useState('')
	const [selectedRepoName, setSelectedRepoName] = useState('')
	const submit: SubmitFunction = useSubmit()
	const location = useLocation()
	const navigate = useNavigate()

	useEffect(() => {
		if (location.state === 'remove-filter') {
			setSelectedLang('')
			setSelectedRepoName('')
		}
	}, [location.state])

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
		navigate('/')
	}

	const handleRepoClick = async (rep: Repo) => {
		const defaultBranch = rep.default_branch
		const branchUrl = rep.branches_url?.replace(
			'{/branch}',
			`/${defaultBranch}`
		)
		setSelectedRepoName(rep.full_name)
		const formData = new FormData()
		formData.append('commit_url', branchUrl ? branchUrl : '')
		formData.append('full_name', rep.full_name ? rep.full_name : '')
		const options: SubmitOptions = {
			method: 'post',
			action: rep.full_name.replace('silverorange/', 'silverorange-'),
		}
		submit(formData, options)
	}

	return (
		<div
			style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}
			className="repos-container"
		>
			<h1>SO Remixed</h1>
			<div className="buttons-list">
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
			</div>
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

export default function App() {
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<Home />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
