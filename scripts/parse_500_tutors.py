#!/usr/bin/env python3
import json
import zlib
import re
import os

def parse_runs(decomp):
    runs = []
    idx = 0
    n = len(decomp)
    while idx < n:
        if decomp[idx:idx+1] == b'[':
            end_bracket = decomp.find(b']', idx)
            if end_bracket != -1:
                after = decomp[end_bracket+1:end_bracket+10].strip()
                if after.startswith(b'TJ'):
                    tj_data = decomp[idx+1:end_bracket]
                    parts = []
                    p_idx = 0
                    p_n = len(tj_data)
                    while p_idx < p_n:
                        if tj_data[p_idx:p_idx+1] == b'(':
                            p_idx += 1
                            s_bytes = bytearray()
                            esc = False
                            while p_idx < p_n:
                                b = tj_data[p_idx]
                                if esc:
                                    s_bytes.append(b)
                                    esc = False
                                elif b == 92:
                                    esc = True
                                elif b == 41:
                                    break
                                else:
                                    s_bytes.append(b)
                                p_idx += 1
                            parts.append(s_bytes.decode('latin1', errors='ignore'))
                        p_idx += 1
                    runs.append(''.join(parts))
                    idx = end_bracket + 2
                    continue
        elif decomp[idx:idx+1] == b'(':
            start = idx + 1
            s_bytes = bytearray()
            esc = False
            p_idx = start
            while p_idx < n:
                b = decomp[p_idx]
                if esc:
                    s_bytes.append(b)
                    esc = False
                elif b == 92:
                    esc = True
                elif b == 41:
                    break
                else:
                    s_bytes.append(b)
                p_idx += 1
            after = decomp[p_idx+1:p_idx+10].strip()
            if after.startswith(b'Tj'):
                runs.append(s_bytes.decode('latin1', errors='ignore'))
                idx = p_idx + 2
                continue
        idx += 1
    return runs

def extract_rows(streams, base_page_idx, cols_per_row):
    rows = []
    for p in range(17):
        stream_idx = base_page_idx + p
        decomp = zlib.decompress(streams[stream_idx])
        runs = parse_runs(decomp)
        if p == 0:
            # skip first header row
            data_runs = runs[cols_per_row:]
        else:
            data_runs = runs
        # chunk into rows of size cols_per_row
        for r_i in range(0, len(data_runs), cols_per_row):
            row = data_runs[r_i:r_i + cols_per_row]
            if len(row) == cols_per_row:
                rows.append([item.strip() for item in row])
    return rows

def main():
    pdf_path = 'public/assets/aistudio/Global_500_Master_Tutors_Direct_Subjects_dd36b2fe.pdf'
    with open(pdf_path, 'rb') as f:
        data = f.read()

    stream_pattern = re.compile(b'stream[\r\n]+(.*?)[\r\n]+endstream', re.DOTALL)
    streams = stream_pattern.findall(data)

    print(f'Total streams: {len(streams)}')

    table1 = extract_rows(streams, 0, 4)    # ID, Name, Tier, Country
    table2 = extract_rows(streams, 17, 4)   # Location, Rating, Reviews, Hourly Rate
    table3 = extract_rows(streams, 34, 2)   # Primary Subject, Education
    table4 = extract_rows(streams, 51, 1)   # Experience Summary
    table5 = extract_rows(streams, 68, 2)   # Subject Expertise, Availability
    table6 = extract_rows(streams, 85, 2)   # Can Meet, Hobbies
    table7 = extract_rows(streams, 102, 1)  # Verification Status

    print(f'Table 1 rows: {len(table1)}')
    print(f'Table 2 rows: {len(table2)}')
    print(f'Table 3 rows: {len(table3)}')
    print(f'Table 4 rows: {len(table4)}')
    print(f'Table 5 rows: {len(table5)}')
    print(f'Table 6 rows: {len(table6)}')
    print(f'Table 7 rows: {len(table7)}')

    assert len(table1) == 500, f'Expected 500 rows for Table 1, got {len(table1)}'
    assert len(table2) == 500, f'Expected 500 rows for Table 2, got {len(table2)}'
    assert len(table3) == 500, f'Expected 500 rows for Table 3, got {len(table3)}'
    assert len(table4) == 500, f'Expected 500 rows for Table 4, got {len(table4)}'
    assert len(table5) == 500, f'Expected 500 rows for Table 5, got {len(table5)}'
    assert len(table6) == 500, f'Expected 500 rows for Table 6, got {len(table6)}'
    assert len(table7) == 500, f'Expected 500 rows for Table 7, got {len(table7)}'

    tutors = []
    country_map = {
        'USA': 'United States',
        'UK': 'United Kingdom',
        'Australia': 'Australia',
        'Canada': 'Canada',
        'Singapore': 'Singapore',
        'Ireland': 'Ireland',
        'New Zealand': 'New Zealand',
        'UAE': 'United Arab Emirates'
    }

    country_counts = {}
    primary_subjects_set = set()

    # Avatars from Unsplash portraits
    portrait_avatars = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256"
    ]

    for i in range(500):
        t1 = table1[i]
        t2 = table2[i]
        t3 = table3[i]
        t4 = table4[i]
        t5 = table5[i]
        t6 = table6[i]
        t7 = table7[i]

        num_id = int(t1[0])
        name = t1[1]
        tutor_tier = t1[2] # e.g. "Master Tutor (Executive / Chair)" or "Senior Tutor / Expert"
        country_code = t1[3]
        country_full = country_map.get(country_code, country_code)

        country_counts[country_code] = country_counts.get(country_code, 0) + 1

        location = t2[0]
        rating = float(t2[1])
        reviews_count = int(t2[2])
        rate_str = t2[3].replace('$', '').strip()
        hourly_rate = float(rate_str)

        primary_subject = t3[0].strip()
        education = t3[1].strip()
        primary_subjects_set.add(primary_subject)

        experience = t4[0].strip()

        # subject expertise list
        raw_subjects = t5[0].strip()
        subject_list = [s.strip() for s in raw_subjects.split(',') if s.strip()]
        # ensure primary subject is included first in list
        if primary_subject and primary_subject not in subject_list:
            subject_list.insert(0, primary_subject)
        availability = t5[1].strip()

        can_meet = t6[0].strip()
        hobbies = t6[1].strip()

        verification_status = t7[0].strip()

        tutor_id_str = f"tutor_global_{num_id:03d}"
        avatar = portrait_avatars[(num_id - 1) % len(portrait_avatars)]

        record = {
            "id": tutor_id_str,
            "numericId": num_id,
            "name": name,
            "email": f"tutor.{num_id:03d}@university-tutors.com",
            "role": "tutor",
            "tutorTier": tutor_tier,
            "isMasterTutor": "Master Tutor" in tutor_tier,
            "country": country_code,
            "countryFull": country_full,
            "location": location,
            "rating": rating,
            "reviewsCount": reviews_count,
            "hourlyRate": hourly_rate,
            "primarySubject": primary_subject,
            "education": education,
            "experience": experience,
            "subjectExpertise": subject_list,
            "availability": availability,
            "canMeet": can_meet,
            "hobbies": hobbies,
            "verificationStatus": verification_status,
            "isVerified": "Verified" in verification_status,
            "avatarUrl": avatar,
            "headline": f"{tutor_tier} • {primary_subject} Specialist",
            "bio": f"{experience} Academic qualifications: {education}. Available for {availability.lower()}."
        }
        tutors.append(record)

    print("Summary of Parsed 500 Tutors:")
    print(f"Total Tutors: {len(tutors)}")
    print("Country distribution:", country_counts)
    print(f"Distinct primary subjects ({len(primary_subjects_set)}):", sorted(list(primary_subjects_set))[:15])

    # Save to public/tutors_500.json
    out_json = 'public/tutors_500.json'
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(tutors, f, indent=2)
    print(f"Saved {out_json} ({os.path.getsize(out_json)} bytes)")

    # Also save to public/tutors_200.json as backwards compatibility
    with open('public/tutors_200.json', 'w', encoding='utf-8') as f:
        json.dump(tutors, f, indent=2)

    # Generate TypeScript file: src/data/trendingTutors500Data.ts
    ts_code = """// Master dataset of 500 Verified International Tutors
// Directly extracted from Global_500_Master_Tutors_Direct_Subjects

export interface TrendingTutor {
  id: string;
  numericId: number;
  name: string;
  email: string;
  role: 'tutor';
  tutorTier: string;
  isMasterTutor: boolean;
  country: string;
  countryFull: string;
  location: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  primarySubject: string;
  education: string;
  experience: string;
  subjectExpertise: string[];
  availability: string;
  canMeet: string;
  hobbies: string;
  verificationStatus: string;
  isVerified: boolean;
  avatarUrl: string;
  headline: string;
  bio: string;
}

export const TRENDING_TUTORS_500: TrendingTutor[] = """ + json.dumps(tutors, indent=2) + """;

// Backwards-compatible alias for previous imports
export const TRENDING_TUTORS_200: TrendingTutor[] = TRENDING_TUTORS_500;
"""
    ts_file = 'src/data/trendingTutors500Data.ts'
    with open(ts_file, 'w', encoding='utf-8') as f:
        f.write(ts_code)
    print(f"Saved {ts_file} ({os.path.getsize(ts_file)} bytes)")

    # Also update src/data/trendingTutors200Data.ts to re-export from trendingTutors500Data
    ts_compat = """// Compatibility re-export pointing to the 500 Master Tutors dataset
export * from './trendingTutors500Data';
"""
    with open('src/data/trendingTutors200Data.ts', 'w', encoding='utf-8') as f:
        f.write(ts_compat)
    print("Updated src/data/trendingTutors200Data.ts to re-export 500 tutors")

if __name__ == '__main__':
    main()
