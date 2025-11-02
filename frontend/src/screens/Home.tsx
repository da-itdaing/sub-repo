import Card from '../common/components/Card'
import { api } from '../common/services/api'
import { useEffect, useMemo, useState } from 'react'
import type { Event, Popup } from '../types'
import Carousel from '../common/components/Carousel'
import Chips from '../common/components/Chips'
import SectionHeader from '../common/components/SectionHeader'
import BottomTab from '../common/components/BottomTab'
import { Link } from 'react-router-dom'

export default function Home() {
  const [eventList, setEventList] = useState<Event[]>([])
  const [popupList, setPopupList] = useState<Popup[]>([])
  const [favorite, setFavorite] = useState<Record<string, boolean>>({})
  const [district, setDistrict] = useState<string>('전체')

  useEffect(() => {
    api.listEvents().then(setEventList)
    api.listPopups().then(setPopupList)
  }, [])

  const banners = useMemo(() => eventList.slice(0, 6).map(e => ({ id: e.id, image: e.image, title: e.title })), [eventList])
  const chips = ['전체', '남구', '동구', '서구', '북구/광산구']
  const filteredPopups = useMemo(() => district === '전체' ? popupList : popupList.filter(p => p.district === district.replace('/광산구','')), [district, popupList])

  return (
    <div>
      {/* 1. 상단 배너 캐러셀 */}
      <Carousel items={banners} />

      {/* 2. 오픈 예정 섹션 */}
      <SectionHeader title="곧 오픈한다잉! 11월" to="/consumer/events" />
      <div className="grid">
        {eventList.slice(0,6).map(ev => (
          <Link key={ev.id} to={`/consumer/events/${ev.id}`} style={{ display: 'block' }}>
            <Card
              image={ev.image}
              title={ev.title}
              subtitle={ev.dateRange}
              footnote={ev.location}
            />
          </Link>
        ))}
      </div>

      {/* 3. 구 단위 필터 + 팝업 카드 */}
  <SectionHeader title="올 동네에 이런 플리마켓 있다잉!" to="/consumer/popups" style={{marginTop: 24}} />
      <Chips items={chips} value={district} onChange={setDistrict} />
      <div className="grid">
        {filteredPopups.map(p => (
          <Link key={p.id} to={`/consumer/popup/${p.id}`} style={{ display: 'block' }}>
            <Card
              image={p.image}
              title={p.title}
              subtitle={p.dateRange}
              footnote={p.district}
            />
          </Link>
        ))}
      </div>

      {/* 4. 하단 탭바 */}
      <BottomTab />
    </div>
  )
}
