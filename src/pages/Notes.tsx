import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Note } from '../types/supabase'

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      if (!data || data.length === 0) {
        setNotes(sampleNotes)
      } else {
        setNotes(data as Note[])
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      setNotes(sampleNotes)
    } finally {
      setLoading(false)
    }
  }

  const sampleNotes: Note[] = [
    {
      id: 1,
      title: 'Understanding Neurodevelopmental Disorders: A Guide for Families',
      date: new Date().toISOString().split('T')[0],
      excerpt: 'Neurodevelopmental Disorders (ND) affect how children learn, communicate, and interact with the world. This comprehensive guide helps families understand autism, ADHD, dyslexia, and other conditions, providing clarity and hope for the journey ahead.',
      featured: true,
    },
    {
      id: 2,
      title: 'Supporting Your Child\'s Social and Emotional Development',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      excerpt: 'Every child develops at their own pace. For children with neurodevelopmental differences, social and emotional growth may look different. Learn practical strategies to nurture confidence, friendship skills, and emotional regulation.',
    },
    {
      id: 3,
      title: 'Navigating School Support Systems for Children with ND',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      excerpt: 'Accessing the right educational support can transform your child\'s school experience. This article explains IEPs, 504 plans, classroom accommodations, and how to work effectively with educators to ensure your child thrives.',
    },
    {
      id: 4,
      title: 'Creating Inclusive Play Opportunities for All Children',
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      excerpt: 'Play is essential for every child\'s development. Discover how to create inclusive play spaces and activities that welcome children with neurodevelopmental differences, fostering friendships and building skills through fun.',
    },
  ]

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
            Notes
          </h1>
          <p className="text-xl text-gray-700 text-center mb-12">
            Discover the best notes about Neurodevelopmental Disorders (ND) that support your journey
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    {note.featured && (
                      <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                        Featured
                      </span>
                    )}
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(note.date)}
                    </p>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                      {note.title}
                    </h2>
                    <p className="text-gray-700 mb-4">
                      {note.excerpt}
                    </p>
                    <Link
                      to={`/notes/${note.id}`}
                      className="text-primary-600 font-semibold hover:text-primary-700 transition-colors inline-flex items-center"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

