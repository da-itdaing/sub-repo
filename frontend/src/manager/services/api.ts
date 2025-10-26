import type { } from '../../types'

export type AdminQuestion = {
	id: string
	title: string
	question: string
	answer?: string
	date: string // YYYY-MM-DD
}

const KEY = 'manager:qna'

function load(): AdminQuestion[] {
	try {
		const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
		if (!raw) return seed()
		const arr = JSON.parse(raw) as AdminQuestion[]
		if (!Array.isArray(arr)) return seed()
		return arr
	} catch {
		return seed()
	}
}

function save(arr: AdminQuestion[]) {
	try { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(arr)) } catch {}
}

function seed(): AdminQuestion[] {
	const arr: AdminQuestion[] = [
		{ id: 'q1', title: '등록 절차 문의', question: '팝업 등록 승인까지 얼마나 걸리나요?', date: '2025-10-20' },
		{ id: 'q2', title: '수정 반려 사유', question: '이미지 규격이 맞지 않는다고 합니다. 기준이 뭔가요?', date: '2025-10-21' }
	]
	save(arr)
	return arr
}

export const managerApi = {
	async listQna(): Promise<AdminQuestion[]> { return load() },
	async getQna(id: string): Promise<AdminQuestion | undefined> { return load().find(q => q.id === id) },
	async createQna(input: { title: string; question: string }): Promise<AdminQuestion> {
		const arr = load()
		const item: AdminQuestion = { id: 'q' + (arr.length + 1), title: input.title, question: input.question, date: new Date().toISOString().slice(0,10) }
		arr.unshift(item)
		save(arr)
		return item
	},
	async updateQna(id: string, answer: string): Promise<AdminQuestion | undefined> {
		const arr = load()
		const idx = arr.findIndex(q => q.id === id)
		if (idx < 0) return undefined
		arr[idx] = { ...arr[idx], answer }
		save(arr)
		return arr[idx]
	},
	async deleteQna(id: string): Promise<void> {
		const arr = load().filter(q => q.id !== id)
		save(arr)
	}
}

export default managerApi
